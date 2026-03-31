import type {
	TokenService,
	TokenPayload,
	LoginClientParams,
} from '../../ports/Services';
import type { LoginResponse } from '../../ports/Models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { UnauthorizedError } from '@GenericSubdomains/utils/domainError';
import { TOKEN_EXPIRATION_TIME } from 'server-config/config';

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

export function loginClientFactory(dependencies: LoginClientDependencies) {
	return async function loginClient(
		params: LoginClientParams,
	): Promise<LoginResponse> {
		const { tokenService, hashService, usersContract } = dependencies;
		const lockoutKey = normalizeKey(params.email);
		const lockoutEntry = getLockoutEntry(lockoutKey);

		if (lockoutEntry?.lockedUntil && lockoutEntry.lockedUntil > Date.now()) {
			throw new UnauthorizedError('Too many login attempts. Try again later.');
		}

		const client = await usersContract.selectAuthUserByEmail(params.email);

		if (!client) {
			registerFailedAttempt(lockoutKey);
			throw new UnauthorizedError('Invalid credentials');
		}
		if (client.status === 'banned') {
			registerFailedAttempt(lockoutKey);
			throw new UnauthorizedError('Client is banned');
		}

		const isPasswordValid = await hashService.compare(
			params.password,
			client.passwordHash,
		);

		if (!isPasswordValid) {
			registerFailedAttempt(lockoutKey);
			throw new UnauthorizedError('Invalid credentials');
		}

		clearLockout(lockoutKey);

		const tokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
		};

		const token = await tokenService.generateToken(
			tokenPayload,
			TOKEN_EXPIRATION_TIME,
		);
		return {
			token,
			client: {
				id: client.id,
				role: client.role,
				status: client.status,
			},
		};
	};
}
