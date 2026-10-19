import Elysia, { type Cookie } from 'elysia';
import { AppError } from '@AppError';
import {
	CSRF_COOKIE_NAME,
	CSRF_HEADER_NAME,
	API_URL_PREFIX,
	isCsrfEnabled,
} from 'server-config/config';
import { CORS_ORIGINS } from 'server-config/cors/variables';
import { originMatchesAllowlist } from 'server-config/utils/origin';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_SKIP_PATHS = [`${API_URL_PREFIX}/auth/login`];

const CSRF_SKIP_PATHS = (process.env.CSRF_SKIP_PATHS ?? '')
	.split(',')
	.map((p) => p.trim())
	.filter(Boolean);

const CSRF_ORIGIN_ALLOWLIST = (process.env.CSRF_ORIGIN_ALLOWLIST ?? '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

const BOOTSTRAP_PATH = `${API_URL_PREFIX}/internal/bootstrap-admin`;
const BOOTSTRAP_HEADER = 'x-bootstrap-secret';
const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET ?? '';
const BOOTSTRAP_ALLOWED_IPS = (process.env.BOOTSTRAP_ALLOWED_IPS ?? '')
	.split(',')
	.map((ip) => ip.trim())
	.filter(Boolean);

function getClientIp(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for') ?? '';
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) return first;
	}
	return (
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-real-ip') ??
		request.headers.get('x-client-ip') ??
		''
	);
}

export function createCsrfOriginValidator(
	corsOrigins: string[],
	csrfOrigins: string[],
): (origin: string) => boolean {
	const trustedOrigins = csrfOrigins.length > 0 ? csrfOrigins : corsOrigins;

	return (origin) => {
		if (!origin || trustedOrigins.length === 0) return false;
		if (
			corsOrigins.length > 0 &&
			!originMatchesAllowlist(origin, corsOrigins)
		) {
			return false;
		}
		return originMatchesAllowlist(origin, trustedOrigins);
	};
}

const isOriginAllowed = createCsrfOriginValidator(
	CORS_ORIGINS,
	CSRF_ORIGIN_ALLOWLIST,
);

function shouldSkip(pathname: string): boolean {
	return DEFAULT_SKIP_PATHS.concat(CSRF_SKIP_PATHS).some((path) =>
		pathname.startsWith(path),
	);
}

type CsrfGuardOptions = {
	isEnabled: () => boolean;
	isOriginAllowed: (origin: string) => boolean;
	shouldSkip: (pathname: string) => boolean;
};

export function createCsrfGuard(
	options: CsrfGuardOptions = {
		isEnabled: isCsrfEnabled,
		isOriginAllowed,
		shouldSkip,
	},
) {
	return ({
		request,
		cookie,
	}: {
		request: Request;
		cookie: Record<string, Cookie<unknown>>;
	}) => {
		if (!options.isEnabled()) return;
		if (SAFE_METHODS.has(request.method)) return;

		const pathname = new URL(request.url).pathname;
		if (
			pathname.startsWith(BOOTSTRAP_PATH) &&
			BOOTSTRAP_SECRET &&
			request.headers.get(BOOTSTRAP_HEADER) === BOOTSTRAP_SECRET
		) {
			const clientIp = getClientIp(request);
			if (
				clientIp &&
				BOOTSTRAP_ALLOWED_IPS.length > 0 &&
				BOOTSTRAP_ALLOWED_IPS.includes(clientIp)
			) {
				return;
			}
		}
		if (options.shouldSkip(pathname)) return;

		const origin =
			request.headers.get('origin') ?? request.headers.get('referer') ?? '';
		let originHost = '';
		if (origin) {
			try {
				originHost = new URL(origin).origin;
			} catch {
				originHost = '';
			}
		}
		if (!options.isOriginAllowed(originHost)) {
			throw new AppError({
				statusCode: 403,
				message: 'CSRF origin is not allowed',
				code: 'FORBIDDEN',
			});
		}

		const headerToken = request.headers.get(CSRF_HEADER_NAME) ?? '';
		const cookieToken = cookie[CSRF_COOKIE_NAME]?.value ?? '';

		if (!headerToken || !cookieToken || headerToken !== cookieToken) {
			throw new AppError({
				statusCode: 403,
				message: 'CSRF token is missing or invalid',
				code: 'FORBIDDEN',
			});
		}
	};
}

export function createCsrfPlugin(options?: CsrfGuardOptions) {
	return new Elysia().onBeforeHandle(
		{ as: 'global' },
		createCsrfGuard(options),
	);
}

export const CsrfPlugin = createCsrfPlugin();
