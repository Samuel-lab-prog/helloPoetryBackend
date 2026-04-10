import { Elysia } from 'elysia';
// Plugins
import cors from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { rateLimit } from 'elysia-rate-limit';
import { ErrorPlugin } from '@GenericSubdomains/utils/plugins/errorPlugin';
import { LoggerPlugin } from '@GenericSubdomains/utils/plugins/loggerPlugin';
import { SetupPlugin } from '@SetupPlugin';
import { CsrfPlugin } from '@GenericSubdomains/utils/plugins/csrfPlugin';
import { SecurityHeadersPlugin } from '@GenericSubdomains/utils/plugins/securityHeadersPlugin';
import { RequestCachePlugin } from '@GenericSubdomains/utils/plugins/requestCachePlugin';

// Necessary to register notification event listeners.
import '@Domains/notifications/EventListeners.ts';

// Routers
import {
	userQueriesRouter,
	userCommandsRouter,
	userCommandsRouterWithFakeHash,
	userInternalRouter,
	userInternalRouterWithFakeHash,
} from '@Domains/users-management/Composition';
import {
	authRouter,
	authRouterWithFakeHash,
} from '@GenericSubdomains/authentication/Composition';
import {
	poemsCommandsRouter,
	poemsQueriesRouter,
} from '@Domains/poems-management/Composition';
import {
	friendsCommandsRouter,
	friendsQueriesRouter,
} from '@Domains/friends-management/Composition';
import {
	interactionsCommandsRouter,
	interactionsQueriesRouter,
} from '@Domains/interactions/Composition';
import { moderationCommandsRouter } from '@Domains/moderation/Composition';
import { feedQueriesRouter } from '@Domains/feed-engine/Composition';
import {
	notificationsCommandsRouter,
	notificationsQueriesRouter,
} from '@Domains/notifications/Composition';
import {
	ELYSIA_SERVER_SETTINGS,
	OPEN_API_SETTINGS,
} from 'server-config/config';
import { corsConfig } from 'server-config/cors/config';
import {
	AUTH_RATE_LIMIT_SETTINGS,
	RATE_LIMIT_SETTINGS,
} from 'server-config/rate-limiter/config';

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
	return (
		new Elysia(ELYSIA_SERVER_SETTINGS)
			.use(enableDocs ? openapi(OPEN_API_SETTINGS) : undefined)
			// Global and auth-specific limits are applied separately.
			.use(enableRateLimit ? rateLimit(AUTH_RATE_LIMIT_SETTINGS) : undefined)
			.use(enableRateLimit ? rateLimit(RATE_LIMIT_SETTINGS) : undefined)
			.use(enableLogger ? LoggerPlugin : undefined)
			.use(cors(corsConfig))
			.use(SetupPlugin)
			.use(RequestCachePlugin)
			.use(SecurityHeadersPlugin)
			.use(CsrfPlugin)
			.use(ErrorPlugin)

			.use(enableRealHash ? userInternalRouter : userInternalRouterWithFakeHash)
			.use(enableRealHash ? userCommandsRouter : userCommandsRouterWithFakeHash)
			.use(enableRealHash ? authRouter : authRouterWithFakeHash)
			.use(userQueriesRouter)
			.use(poemsCommandsRouter)
			.use(poemsQueriesRouter)
			.use(friendsCommandsRouter)
			.use(friendsQueriesRouter)
			.use(interactionsCommandsRouter)
			.use(interactionsQueriesRouter)
			.use(moderationCommandsRouter)
			.use(feedQueriesRouter)
			.use(notificationsCommandsRouter)
			.use(notificationsQueriesRouter)
	);
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
