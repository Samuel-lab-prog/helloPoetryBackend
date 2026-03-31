import { fromTypes } from '@elysiajs/openapi';
import { BunAdapter } from 'elysia/adapter/bun';
import { sanitize } from '@GenericSubdomains/utils/xssClean';
import { MissingEnvVarError } from '@AppError';
import { parseNumber } from './envParsers';

/** API prefix for all routes. */
export const PREFIX = '/api/v1';
/** Elysia instance name. */
export const MAIN_INSTANCE_NAME = 'mainServerInstance';
/** Host to bind. */
export const HOST_NAME = '0.0.0.0';
/** Port to listen on. */
export const PORT = parseNumber({
	name: 'PORT',
	value: process.env.PORT,
	fallback: 5000,
	min: 1,
});

export const OPEN_API_SETTINGS = {
	path: '/docs',
	documentation: {
		info: {
			title: 'Social Media API',
			description: 'API documentation for HelloPoetry API',
			version: '1.0.0',
		},
	},
	references: fromTypes(),
};

export const ELYSIA_SETTINGS = {
	adapter: BunAdapter,
	name: MAIN_INSTANCE_NAME,
	prefix: PREFIX,
	sanitize: (value: string) =>
		typeof value === 'string' ? sanitize(value) : value,
	bodyLimit: parseNumber({
		name: 'BODY_LIMIT_BYTES',
		value: process.env.BODY_LIMIT_BYTES,
		fallback: 1_000_000,
		min: 1,
	}),
	serve: {
		hostname: HOST_NAME,
		port: PORT,
	},
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const SECURITY_HEADERS_ENABLED =
	process.env.SECURITY_HEADERS_ENABLED !== 'false';

/** Whether to apply security headers. */
export function shouldApplySecurityHeaders(): boolean {
	return SECURITY_HEADERS_ENABLED;
}

type LogLevel = 'silent' | 'debug' | 'info';

// Determines the appropriate log level based on the current environment.
export function getLogLevel(): LogLevel {
	if (NODE_ENV === 'test') return 'silent';

	if (NODE_ENV === 'dev' || NODE_ENV === 'development') return 'debug';

	return 'info';
}

const DEFAULT_TEST_DATABASE_URL =
	'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';
/**
 * Database URL from env with a test fallback outside production.
 */
export function getDatabaseUrl(): string {
	const url =
		process.env.DATABASE_URL ??
		(NODE_ENV === 'production' ? undefined : DEFAULT_TEST_DATABASE_URL);

	if (!url) throw MissingEnvVarError('DATABASE_URL');

	return url;
}

/**
 * Retrieves the JWT secret key from environment variables.
 * @returns The JWT secret key.
 * @throws An AppError if the JWT_SECRET_KEY environment variable is not set in non-test environments.
 * This function ensures that a secret key is always available for signing JWTs, which is crucial
 * for authentication and security. In test environments, it provides a default value to facilitate
 * testing without requiring additional configuration.
 */
export {
	CSRF_COOKIE_NAME,
	CSRF_HEADER_NAME,
	getJwtSecretKey,
	isCsrfEnabled,
	setUpCookieTokenOptions,
	setUpCsrfCookieOptions,
	TOKEN_EXPIRATION_TIME,
} from './auth/config';
