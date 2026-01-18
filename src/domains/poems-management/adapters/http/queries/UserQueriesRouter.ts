import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@GenericSubdomains/authentication/adapters/http/auth-plugin/AuthPlugin';

import { MyPoemSchema } from '../../schemas/MyPoemSchema';
import { AuthorPoemSchema } from '../../schemas/AuthorPoemSchema';
import { idSchema } from '../../schemas/parameters/IdSchema';

import {
	type PoemQueriesRouterServices,
	poemQueriesServices,
} from './Services';
import { appErrorSchema } from '@AppError';

export function createPoemsQueriesRouter(services: PoemQueriesRouterServices) {
	return new Elysia({ prefix: '/poems' })
		.use(AuthPlugin)
		.get(
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
		)
		.get(
			'authors/:authorId',
			({ params, auth }) => {
				return services.getAuthorPoems({
					requesterId: auth.clientId,
					authorId: params.authorId,
				});
			},
			{
				response: {
					200: t.Array(AuthorPoemSchema),
				},
				params: t.Object({
					authorId: idSchema,
				}),
				detail: {
					summary: "Get Author's Poems",
					description:
						'Returns the list of published public poems authored by the specified author.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'/:poemId',
			({ params, auth }) => {
				return services.getPoemById({
					requesterId: auth.clientId,
					poemId: params.poemId,
				});
			},
			{
				response: {
					200: t.Union([AuthorPoemSchema, MyPoemSchema]),
					403: appErrorSchema,
				},
				params: t.Object({
					poemId: idSchema,
				}),
				detail: {
					summary: 'Get Poem by ID',
					description:
						'Returns the poem with the specified ID if the requester has access to it.',
					tags: ['Poems Management'],
				},
			},
		);
}

export const poemsQueriesRouter = createPoemsQueriesRouter(poemQueriesServices);
