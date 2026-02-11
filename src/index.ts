import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { openapi, fromTypes } from '@elysiajs/openapi';
import { rateLimit } from 'elysia-rate-limit';
import { BunAdapter } from 'elysia/adapter/bun';

import { ErrorPlugin } from '@GenericSubdomains/utils/plugins/errorPlugin';
import { LoggerPlugin } from '@GenericSubdomains/utils/plugins/loggerPlugin';
import { SetupPlugin } from '@GenericSubdomains/utils/plugins/setupPlugin';
import { sanitize } from '@GenericSubdomains/utils/xssClean';

import { userQueriesRouter } from './domains/users-management/adapters/queries/Router';
import { poemsQueriesRouter } from './domains/poems-management/adapters/queries/Router';
import { poemsCommandsRouter } from './domains/poems-management/adapters/commands/Router';
import { friendsCommandsRouter } from '@Domains/friends-management/adapters/commands/Router';
import { interactionsCommandsRouter } from '@Domains/interactions/adapters/commands/Router';
import { interactionsQueriesRouter } from '@Domains/interactions/adapters/queries/Router';
import { moderationCommandsRouter } from '@Domains/moderation/adapters/commands/Router';
import { feedQueriesRouter } from '@Domains/feed-engine/adapters/queries/Router';

import {
	userCommandsRouter,
	userCommandsRouterWithFakeHash,
} from 'composition/Users';

import { authRouter, authRouterWithFakeHash } from 'composition/Auth';

export const PREFIX = '/api/v1';
export const MAIN_INSTANCE_NAME = 'mainServerInstance';
export const HOST_NAME = '0.0.0.0';
export const PORT = Number(process.env.PORT) || 5000;

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
	name: MAIN_INSTANCE_NAME,
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

type MakeServerOptions = {
	enableRealHash: boolean;
	enableDocs: boolean;
	enableRateLimit: boolean;
	enableLogger: boolean;
};

function makeServer({
	enableRealHash,
	enableDocs,
	enableRateLimit,
	enableLogger,
}: MakeServerOptions) {
	return new Elysia(ELYSIA_SETTINGS)
		.use(enableDocs ? openapi(OPEN_API_SETTINGS) : undefined)
		.use(enableRateLimit ? rateLimit(RATE_LIMIT_SETTINGS) : undefined)
		.use(enableLogger ? LoggerPlugin : undefined)
		.use(enableRealHash ? userCommandsRouter : userCommandsRouterWithFakeHash)
		.use(cors())
		.use(SetupPlugin)
		.use(ErrorPlugin)
		.use(enableRealHash ? authRouter : authRouterWithFakeHash)
		.use(userQueriesRouter)
		.use(poemsCommandsRouter)
		.use(poemsQueriesRouter)
		.use(friendsCommandsRouter)
		.use(interactionsCommandsRouter)
		.use(interactionsQueriesRouter)
		.use(moderationCommandsRouter)
		.use(feedQueriesRouter);
}

export const server = makeServer({
	enableRealHash: true,
	enableDocs: true,
	enableRateLimit: true,
	enableLogger: true,
});

export const testServer = makeServer({
	enableRealHash: false,
	enableDocs: false,
	enableRateLimit: false,
	enableLogger: false,
});
