import Elysia from 'elysia';
import cors from '@elysiajs/cors';
import { openapi, fromTypes } from '@elysiajs/openapi';
import { rateLimit } from 'elysia-rate-limit';
import { BunAdapter } from 'elysia/adapter/bun';

import { ErrorPlugin } from '@utils/plugins/errorPlugin';
import { LoggerPlugin } from '@utils/plugins/loggerPlugin';
import { sanitize } from '@utils/xssClean';

import { authRouter } from './generic-subdomains/authentication/adapters/http/AuthRouter';

const PREFIX = '/api/v1';
const INSTANCE_NAME = 'mainServerInstance';
const HOST_NAME = '0.0.0.0';
const PORT = Number(process.env.PORT) || 5000;

const OPEN_API_SETTINGS = {
	path: '/docs',
	documentation: {
		info: {
			title: 'Blog API',
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

export const server = new Elysia(ELYSIA_SETTINGS)
	.use(cors())
	.use(LoggerPlugin)
	.use(ErrorPlugin)
	.use(
		rateLimit({
			max: 1000,
			duration: 15 * 60 * 1000,
			skip: () => process.env.NODE_ENV === 'test',
		}),
	)
	.use(openapi(OPEN_API_SETTINGS))
	.use(authRouter)
	.listen({ hostname: HOST_NAME, port: PORT });
