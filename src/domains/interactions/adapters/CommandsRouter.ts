/* eslint-disable max-lines-per-function */
import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemLikeSchema } from '../ports/schemas/PoemLikeSchema';

import { type CommandsRouterServices } from '../ports/Commands';
import { appErrorSchema } from '@AppError';
import { PoemCommentSchema } from '../ports/schemas/PoemCommentSchema';

export function createInteractionsCommandsRouter(
	services: CommandsRouterServices,
) {
	return new Elysia({ prefix: '/interactions' })
		.use(AuthPlugin)
		.post(
			'/poems/:id/like',
			({ auth, params, set }) => {
				const rs = services.likePoem({
					userId: auth.clientId,
					poemId: params.id,
				});
				set.status = 201;
				return rs;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					201: PoemLikeSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Like Poem',
					description: 'Adds a like to a poem by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.delete(
			'/poems/:id/like',
			({ auth, params, set }) => {
				const rs = services.unlikePoem({
					userId: auth.clientId,
					poemId: params.id,
				});
				set.status = 204;
				return rs;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					204: t.Void(),
					404: appErrorSchema,
				},
				detail: {
					summary: 'Unlike Poem',
					description: 'Removes a like from a poem by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.post(
			'/poems/:id/comments',
			({ auth, params, body, set }) => {
				const rs = services.commentPoem({
					userId: auth.clientId,
					poemId: params.id,
					content: body.content,
				});
				set.status = 201;
				return rs;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					content: PoemCommentSchema['properties']['content'],
				}),
				response: {
					201: PoemCommentSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Comment Poem',
					description: 'Adds a comment to a poem by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.delete(
			'/comments/:id',
			async ({ auth, params, set }) => {
				await services.deleteComment({
					userId: auth.clientId,
					commentId: params.id,
				});
				set.status = 204;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					204: t.Void(),
					404: appErrorSchema,
					403: appErrorSchema,
				},
				detail: {
					summary: 'Delete Comment',
					description: 'Deletes a comment made by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		);
}
