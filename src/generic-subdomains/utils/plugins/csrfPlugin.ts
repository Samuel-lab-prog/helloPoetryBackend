import Elysia from 'elysia';
import { AppError } from '../AppError';
import {
	CSRF_COOKIE_NAME,
	CSRF_HEADER_NAME,
	PREFIX,
	isCsrfEnabled,
} from 'server-config/config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_SKIP_PATHS = [`${PREFIX}/auth/login`];

const CSRF_SKIP_PATHS = (process.env.CSRF_SKIP_PATHS ?? '')
	.split(',')
	.map((p) => p.trim())
	.filter(Boolean);

function shouldSkip(pathname: string): boolean {
	return DEFAULT_SKIP_PATHS.concat(CSRF_SKIP_PATHS).some((path) =>
		pathname.startsWith(path),
	);
}

export const CsrfPlugin = new Elysia().onBeforeHandle(({ request, cookie }) => {
	if (!isCsrfEnabled()) return;
	if (SAFE_METHODS.has(request.method)) return;

	const pathname = new URL(request.url).pathname;
	if (shouldSkip(pathname)) return;

	const headerToken = request.headers.get(CSRF_HEADER_NAME) ?? '';
	const cookieToken = cookie[CSRF_COOKIE_NAME]?.value ?? '';

	if (!headerToken || !cookieToken || headerToken !== cookieToken) {
		throw new AppError({
			statusCode: 403,
			message: 'CSRF token is missing or invalid',
			code: 'FORBIDDEN',
		});
	}
});
