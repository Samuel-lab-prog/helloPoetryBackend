import type {
	TokenService,
	TokenPayload,
	LoginClientParams,
} from '../../../ports/externalServices';
import type { LoginResponse } from '../../../ports/models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { UnauthorizedError } from '@DomainError';
import {
	ACCESS_TOKEN_EXPIRATION_TIME,
	REFRESH_TOKEN_EXPIRATION_TIME,
} from 'server-config/config';

export interface LoginClientDependencies {
	tokenService: TokenService;
	hashService: HashServices;
	usersContract: UsersPublicContract;
}

const lockoutState = new Map<
	string,
	{ count: number; firstFailedAt: number; lockedUntil?: number }
>();

const LOCKOUT_THRESHOLD = Number(process.env.AUTH_LOCKOUT_THRESHOLD ?? 5);
const LOCKOUT_WINDOW_MS = Number(
	process.env.AUTH_LOCKOUT_WINDOW_MS ?? 15 * 60 * 1000,
);
const LOCKOUT_DURATION_MS = Number(
	process.env.AUTH_LOCKOUT_DURATION_MS ?? 15 * 60 * 1000,
);
const DEBUG_AUTH_LOGIN =
	process.env.DEBUG_AUTH_LOGIN === 'true' ||
	process.env.NODE_ENV === 'development';

function debugLogin(message: string, details?: Record<string, unknown>) {
	if (!DEBUG_AUTH_LOGIN) return;

	console.log('[auth.login]', message, details ?? '');
}

function normalizeKey(email: string) {
	return email.trim().toLowerCase();
}

function getLockoutEntry(key: string) {
	const now = Date.now();
	const entry = lockoutState.get(key);

	if (!entry) return undefined;

	if (entry.lockedUntil && entry.lockedUntil > now) return entry;

	if (now - entry.firstFailedAt > LOCKOUT_WINDOW_MS) {
		lockoutState.delete(key);
		return undefined;
	}

	return entry;
}

function registerFailedAttempt(key: string) {
	const now = Date.now();
	const entry = getLockoutEntry(key);

	if (!entry) {
		lockoutState.set(key, { count: 1, firstFailedAt: now });
		return;
	}

	const count = entry.count + 1;
	const lockedUntil =
		count >= LOCKOUT_THRESHOLD ? now + LOCKOUT_DURATION_MS : undefined;

	lockoutState.set(key, {
		count,
		firstFailedAt: entry.firstFailedAt,
		lockedUntil,
	});
}

function clearLockout(key: string) {
	lockoutState.delete(key);
}

type LoginClient = NonNullable<
	Awaited<ReturnType<UsersPublicContract['selectAuthUserByEmail']>>
>;

async function findLoginClient(
	usersContract: UsersPublicContract,
	lockoutKey: string,
): Promise<LoginClient> {
	const client = await usersContract.selectAuthUserByEmail(lockoutKey);
	debugLogin('lookup finished', {
		email: lockoutKey,
		found: !!client,
		clientId: client?.id ?? null,
		status: client?.status ?? null,
	});

	if (client?.status === 'banned') {
		debugLogin('blocked because client is banned', {
			email: lockoutKey,
			clientId: client.id,
		});
		registerFailedAttempt(lockoutKey);
		throw new UnauthorizedError('Client is banned');
	}

	const lockoutEntry = getLockoutEntry(lockoutKey);
	if (lockoutEntry?.lockedUntil && lockoutEntry.lockedUntil > Date.now()) {
		debugLogin('blocked because lockout is active', {
			email: lockoutKey,
			lockedUntil: lockoutEntry.lockedUntil,
		});
		throw new UnauthorizedError('Too many login attempts. Try again later.');
	}

	if (!client) {
		debugLogin('blocked because client was not found', { email: lockoutKey });
		registerFailedAttempt(lockoutKey);
		throw new UnauthorizedError('Invalid credentials');
	}
	return client;
}

async function verifyLoginPassword(
	client: LoginClient,
	lockoutKey: string,
	password: string,
	hashService: HashServices,
): Promise<void> {
	const isPasswordValid = await hashService.compare(
		password,
		client.passwordHash,
	);
	debugLogin('password comparison finished', {
		email: lockoutKey,
		clientId: client.id,
		passwordValid: isPasswordValid,
	});

	if (isPasswordValid) return;
	debugLogin('blocked because password did not match', {
		email: lockoutKey,
		clientId: client.id,
	});
	registerFailedAttempt(lockoutKey);
	throw new UnauthorizedError('Invalid credentials');
}

async function createLoginResponse(
	client: LoginClient,
	tokenService: TokenService,
): Promise<LoginResponse> {
	const tokenDetails: Omit<TokenPayload, 'tokenType'> = {
		clientId: client.id,
		role: client.role,
		email: client.email,
	};
	const accessTokenPayload: TokenPayload = {
		...tokenDetails,
		tokenType: 'access',
	};
	const refreshTokenPayload: TokenPayload = {
		...tokenDetails,
		tokenType: 'refresh',
	};
	const accessToken = await tokenService.generateToken(
		accessTokenPayload,
		ACCESS_TOKEN_EXPIRATION_TIME,
	);
	const refreshToken = await tokenService.generateToken(
		refreshTokenPayload,
		REFRESH_TOKEN_EXPIRATION_TIME,
	);
	return {
		accessToken,
		refreshToken,
		client: { id: client.id, role: client.role, status: client.status },
	};
}

async function executeLogin(
	dependencies: LoginClientDependencies,
	params: LoginClientParams,
): Promise<LoginResponse> {
	const lockoutKey = normalizeKey(params.email);
	debugLogin('attempt started', { email: lockoutKey });
	const client = await findLoginClient(dependencies.usersContract, lockoutKey);
	await verifyLoginPassword(
		client,
		lockoutKey,
		params.password,
		dependencies.hashService,
	);
	clearLockout(lockoutKey);
	debugLogin('login succeeded', { email: lockoutKey, clientId: client.id });
	return createLoginResponse(client, dependencies.tokenService);
}

export function loginClientFactory(dependencies: LoginClientDependencies) {
	return function loginClient(params: LoginClientParams) {
		return executeLogin(dependencies, params);
	};
}
