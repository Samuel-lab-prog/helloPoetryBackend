/* eslint-disable max-lines-per-function */
import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { appErrorSchema } from '@AppError';
import { idSchema } from '@SharedKernel/Schemas';

import {
	MyPoemReadSchema,
	AuthorPoemReadSchema,
	PoemPreviewPageSchema,
	SavedPoemSchema,
} from '../ports/schemas/Index';

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
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
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
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
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
		)
		.get(
			'/',
			({ query, auth }) => {
				return services.searchPoems({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
					navigationOptions: {
						limit: query.limit,
						cursor: query.cursor,
					},
					filterOptions: {
						searchTitle: query.searchTitle,
						tags: query.tags,
					},
					sortOptions: {
						orderBy: query.orderBy,
						orderDirection: query.orderDirection,
					},
				});
			},
			{
				response: {
					200: PoemPreviewPageSchema,
				},
				query: t.Object({
					limit: t.Optional(t.Number()),
					cursor: t.Optional(t.Number()),
					searchTitle: t.Optional(t.String()),
					tags: t.Optional(t.Array(t.String())),
					orderBy: t.Optional(
						t.Enum({
							createdAt: 'createdAt',
							title: 'title',
						}),
					),
					orderDirection: t.Optional(
						t.Enum({
							asc: 'asc',
							desc: 'desc',
						}),
					),
				}),

				detail: {
					summary: 'Search Poems',
					description:
						'Returns a paginated list of poems matching the provided filter and sort options.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'/saved',
			({ auth }) => {
				return services.getSavedPoems({
					requesterId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Array(SavedPoemSchema),
				},
				detail: {
					summary: 'Get Saved Poems',
					description:
						'Returns the list of poems saved by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		);
}
