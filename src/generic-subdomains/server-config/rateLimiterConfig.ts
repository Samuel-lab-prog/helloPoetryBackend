import { DefaultContext } from 'elysia-rate-limit';
import type { Server } from 'bun';

import { PREFIX } from './config';

const NODE_ENV = process.env.NODE_ENV || 'development';
const TRUST_PROXY = /^(1|true|yes|on)$/i.test(process.env.TRUST_PROXY ?? '');
const TRUSTED_PROXY_IPS = (process.env.TRUSTED_PROXY_IPS ?? '')
	.split(',')
	.map((ip) => ip.trim())
	.filter(Boolean);
const HAS_TRUSTED_PROXY_IPS = TRUSTED_PROXY_IPS.length > 0;
const RATE_LIMIT_HEADERS = process.env.RATE_LIMIT_HEADERS !== 'false';
const RATE_LIMIT_CONTEXT_SIZE =
	Number(process.env.RATE_LIMIT_CONTEXT_SIZE) || 10000;
const RATE_LIMIT_ERROR_JSON = /^(1|true|yes|on)$/i.test(
	process.env.RATE_LIMIT_ERROR_JSON ?? '',
);
const RATE_LIMIT_SKIP_PATHS = (process.env.RATE_LIMIT_SKIP_PATHS ?? '')
	.split(',')
	.map((path) => path.trim())
	.filter(Boolean);
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 20;
const AUTH_RATE_LIMIT_DURATION_MS =
	Number(process.env.AUTH_RATE_LIMIT_DURATION_MS) || 15 * 60 * 1000;

function getRateLimitKey(
	request: Request,
	server: Server<null> | null,
): string {
	// If behind a trusted proxy, prefer the forwarded client IP (first hop).
	if (TRUST_PROXY && HAS_TRUSTED_PROXY_IPS) {
		const directIp = server?.requestIP(request)?.address ?? '';
		const isTrustedProxy = TRUSTED_PROXY_IPS.includes(directIp);
		if (isTrustedProxy) {
			const forwardedFor = request.headers.get('x-forwarded-for');
			const cfConnectingIp = request.headers.get('cf-connecting-ip');
			const clientIp =
				(forwardedFor ?? '')
					.split(',')
					.map((ip) => ip.trim())
					.filter(Boolean)[0] ??
				cfConnectingIp ??
				directIp;
			if (clientIp) return clientIp;
		}
	}

	// Fallback: direct IP from the server.
	return server?.requestIP(request)?.address ?? 'unknown';
}

function buildRateLimitErrorResponse() {
	if (!RATE_LIMIT_ERROR_JSON) return 'rate-limit reached';

	return new Response(JSON.stringify({ error: 'rate-limit reached' }), {
		status: 429,
		headers: new Headers({ 'Content-Type': 'application/json' }),
	});
}

export const RATE_LIMIT_SETTINGS = {
	max: 1000,
	duration: 15 * 60 * 1000,
	headers: RATE_LIMIT_HEADERS,
	context: new DefaultContext(RATE_LIMIT_CONTEXT_SIZE),
	generator: getRateLimitKey,
	errorResponse: buildRateLimitErrorResponse(),
	skip: (request: Request) => {
		if (NODE_ENV === 'test') return true;
		if (request.method === 'OPTIONS') return true;

		const pathname = new URL(request.url).pathname;
		return RATE_LIMIT_SKIP_PATHS.some((path) => pathname.startsWith(path));
	},
};

export const AUTH_RATE_LIMIT_SETTINGS = {
	max: AUTH_RATE_LIMIT_MAX,
	duration: AUTH_RATE_LIMIT_DURATION_MS,
	headers: RATE_LIMIT_HEADERS,
	countFailedRequest: true,
	context: new DefaultContext(RATE_LIMIT_CONTEXT_SIZE),
	generator: getRateLimitKey,
	errorResponse: buildRateLimitErrorResponse(),
	// Only count requests under auth routes; everything else is skipped.
	skip: (request: Request) => {
		if (NODE_ENV === 'test') return true;
		if (request.method === 'OPTIONS') return true;

		const pathname = new URL(request.url).pathname;
		const authPrefix = `${PREFIX}/auth`;
		if (!pathname.startsWith(authPrefix)) return true;
		return RATE_LIMIT_SKIP_PATHS.some((path) => pathname.startsWith(path));
	},
};
