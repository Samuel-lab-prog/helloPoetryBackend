import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { appErrorSchema } from '@AppError';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import { idSchema } from '@SharedKernel/Schemas';

import { MyPoemReadSchema, AuthorPoemReadSchema } from '../ports/schemas/Index';

import { type QueriesRouterServices } from '../ports/Queries';

export function createPoemsQueriesRouter(services: QueriesRouterServices) {
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
					200: t.Array(MyPoemReadSchema),
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
					authorId: params.authorId,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole as UserRole,
					requesterStatus: auth.clientStatus as UserStatus,
				});
			},
			{
				response: {
					200: t.Array(AuthorPoemReadSchema),
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
					poemId: params.poemId,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole as UserRole,
					requesterStatus: auth.clientStatus as UserStatus,
				});
			},
			{
				response: {
					200: AuthorPoemReadSchema,
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
