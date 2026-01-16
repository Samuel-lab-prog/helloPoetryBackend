import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@root/generic-subdomains/authentication/adapters/http/auth-plugin/AuthPlugin';

import { MyPoemSchema } from '../../schemas/MyPoemSchema';

import {
	type PoemQueriesRouterServices,
	poemQueriesServices,
} from './Services';

export function createPoemsQueriesRouter(services: PoemQueriesRouterServices) {
	return new Elysia({ prefix: '/poems' }).use(AuthPlugin).get(
		'/me',
		({ auth }) => {
			return services.getMyPoems({
				requesterId: auth.clientId,
			});
		},
		{
			response: {
				200: t.Array(MyPoemSchema),
			},
			detail: {
				summary: 'Get My Poems',
				description:
					'Returns the list of poems authored by the authenticated user.',
				tags: ['Poems Management'],
			},
		},
	);
}

export const poemsQueriesRouter = createPoemsQueriesRouter(poemQueriesServices);
