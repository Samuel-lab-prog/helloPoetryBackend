import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@root/generic-subdomains/authentication/adapters/http/auth-plugin/AuthPlugin';

import { idSchema } from '../../schemas/parameters/IdSchema';
import { AuthorPoemSchema } from '../../schemas/AuthorPoemSchema';

import {
	type PoemQueriesRouterServices,
	poemQueriesServices,
} from './Services';

export function createPoemsQueriesRouter(services: PoemQueriesRouterServices) {
	return new Elysia({ prefix: '/users' })
		.use(AuthPlugin)
		.get(
			'/me/poems',
			({ auth }) => {
				return services.getAuthorPoems({
					authorId: auth.clientId,
					requesterId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Array(AuthorPoemSchema),
					403: appErrorSchema,
				},
				detail: {
					summary: 'Get Author Poems',
					description:
						'Returns the list of poems authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'/me/poems/:id',
			({ auth, params }) => {
				return services.getAuthorPoem({
					poemId: Number(params.id),
					authorId: auth.clientId,
					requesterId: auth.clientId,
				});
			},
			{
				response: {
					200: AuthorPoemSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Get Author Poem',
					description: 'Returns the poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		);
}

export const poemsQueriesRouter = createPoemsQueriesRouter(poemQueriesServices);
