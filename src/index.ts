import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { openapi, fromTypes } from '@elysiajs/openapi';
import { rateLimit } from 'elysia-rate-limit';
import { BunAdapter } from 'elysia/adapter/bun';

import { ErrorPlugin } from '@utils/plugins/errorPlugin';
import { LoggerPlugin } from '@utils/plugins/loggerPlugin';
import { SetupPlugin } from '@utils/plugins/setupPlugin';
import { sanitize } from '@utils/xssClean';

import { authRouter } from './generic-subdomains/authentication/adapters/http/auth-router/AuthRouter';
import { readUsersRouter } from './domains/users-management/adapters/http/UsersReadRouter';

const PREFIX = '/api/v1';
const INSTANCE_NAME = 'mainServerInstance';
const HOST_NAME = '0.0.0.0';
const PORT = Number(process.env.PORT) || 5000;

const OPEN_API_SETTINGS = {
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

const ELYSIA_SETTINGS = {
	adapter: BunAdapter,
	name: INSTANCE_NAME,
	prefix: PREFIX,
	sanitize: (value: string) => sanitize(value),
	serve: {
		hostname: HOST_NAME,
		port: PORT,
	},
};

const RATE_LIMIT_SETTINGS = {
	max: 1000,
	duration: 15 * 60 * 1000,
	skip: () => process.env.NODE_ENV === 'test',
};

export const server = new Elysia(ELYSIA_SETTINGS)
	.use(cors())
	.use(SetupPlugin)
	.use(LoggerPlugin)
	.use(ErrorPlugin)
	.use(rateLimit(RATE_LIMIT_SETTINGS))
	.use(openapi(OPEN_API_SETTINGS))
	.use(authRouter)
	.use(readUsersRouter)
	.listen({ hostname: HOST_NAME, port: PORT });
