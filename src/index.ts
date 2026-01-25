import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { openapi, fromTypes } from '@elysiajs/openapi';
import { rateLimit } from 'elysia-rate-limit';
import { BunAdapter } from 'elysia/adapter/bun';

import { ErrorPlugin } from '@GenericSubdomains/utils/plugins/errorPlugin';
import { LoggerPlugin } from '@GenericSubdomains/utils/plugins/loggerPlugin';
import { SetupPlugin } from '@GenericSubdomains/utils/plugins/setupPlugin';
import { sanitize } from '@GenericSubdomains/utils/xssClean';

import { authRouter } from './generic-subdomains/authentication/adapters/http/auth-router/AuthRouter';
import { userQueriesRouter } from './domains/users-management/adapters/http/queries/UserQueriesRouter';
import { userCommandsRouter } from './domains/users-management/adapters/http/commands/UsersCommandsRouter';
import { poemsQueriesRouter } from './domains/poems-management/adapters/http/queries/UserQueriesRouter';
import { poemsCommandsRouter } from './domains/poems-management/adapters/http/commands/QueriesRouter';
import { friendsQueriesRouter } from '@Domains/friends-management/adapters/http/queries/QueriesRouter';
import { friendsCommandsRouter } from '@Domains/friends-management/adapters/http/commands/CommandsRouter';

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
	.use(userQueriesRouter)
	.use(userCommandsRouter)
	.use(poemsQueriesRouter)
	.use(poemsCommandsRouter)
	.use(friendsQueriesRouter)
	.use(friendsCommandsRouter)
	.listen({ hostname: HOST_NAME, port: PORT });
