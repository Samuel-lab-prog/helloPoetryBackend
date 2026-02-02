import { Elysia, t } from 'elysia';
import { OptionalAuthPlugin } from '@OptionalAuthPlugin';
import { AuthPlugin } from '@AuthPlugin';

import { MyPoemSchema, AuthorPoemSchema, idSchema } from '../../schemas/Index';

import { type QueriesRouterServices, queriesRouterServices } from './Services';
import { appErrorSchema } from '@AppError';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export function createPoemsQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/poems' })
		.use(OptionalAuthPlugin)
		.get(
			'authors/:authorId',
			({ params, auth }) => {
				return services.getAuthorPoems({
					requesterId: auth.clientId,
					authorId: params.authorId,
					requesterRole: auth.clientRole as UserRole,
					requesterStatus: auth.clientStatus as UserStatus,
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
					requesterRole: auth.clientRole as UserRole,
					requesterStatus: auth.clientStatus as UserStatus,
					requesterId: auth.clientId,
					poemId: params.poemId,
				});
			},
			{
				response: {
					200: t.Any(),
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
		)
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
		);
}

export const poemsQueriesRouter = createPoemsQueriesRouter(
	queriesRouterServices,
);
