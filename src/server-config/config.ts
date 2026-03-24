import { fromTypes } from '@elysiajs/openapi';
import { BunAdapter } from 'elysia/adapter/bun';
import { type CookieOptions } from 'elysia';

import { sanitize } from '@GenericSubdomains/utils/xssClean';
import '@Domains/notifications/EventListeners.ts';
import { hasCrossSiteCors } from './corsConfig';

export const PREFIX = '/api/v1';
export const MAIN_INSTANCE_NAME = 'mainServerInstance';
export const HOST_NAME = '0.0.0.0';
export const PORT = Number(process.env.PORT) || 5000;

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
	serve: {
		hostname: HOST_NAME,
		port: PORT,
	},
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const CROSS_SITE_COOKIES = /^(1|true|yes|on)$/i.test(
	process.env.CROSS_SITE_COOKIES ?? '',
);
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

type LogLevel = 'silent' | 'debug' | 'info';

export function getLogLevel(): LogLevel {
	if (NODE_ENV === 'test') return 'silent';

	if (NODE_ENV === 'dev' || NODE_ENV === 'development') return 'debug';

	return 'info';
}

export function setUpCookieTokenOptions(token: CookieOptions) {
	const isProd = NODE_ENV === 'production';
	const isCrossSite = CROSS_SITE_COOKIES || hasCrossSiteCors();

	token.httpOnly = true;
	token.path = '/';
	token.maxAge = isProd ? 60 * 60 * 24 * 7 : 60 * 60;
	token.secure = isProd || isCrossSite;
	token.sameSite = isProd || isCrossSite ? 'none' : 'lax';

	if (COOKIE_DOMAIN) token.domain = COOKIE_DOMAIN;
}

export function getDatabaseUrl(): string {
	const url =
		process.env.DATABASE_URL ??
		(NODE_ENV === 'production'
			? undefined
			: 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public');

	if (!url) throw new Error('DATABASE_URL is not set in .env');

	return url;
}

export function getJwtSecretKey(): string {
	const key = process.env.JWT_SECRET_KEY;
	if (!key) throw new Error('JWT_SECRET_KEY is not set in .env');
	return key;
}

export const TOKEN_EXPIRATION_TIME = 3600; // seconds
