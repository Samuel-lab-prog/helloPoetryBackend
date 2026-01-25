/* eslint-disable max-lines-per-function */
import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemLikeSchema } from '../../schemas/PoemLikeSchema';

import {
	type CommandsRouterServices,
	commandsRouterServices,
} from './Services';
import { appErrorSchema } from '@AppError';

function createInteractionsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/interactions' })
		.use(AuthPlugin)
		.post(
			'/poems/:id/like',
			({ auth, params }) => {
				return services.likePoem({
					userId: auth.clientId,
					poemId: Number(params.id),
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: PoemLikeSchema,
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
			({ auth, params }) => {
				return services.unlikePoem({
					userId: auth.clientId,
					poemId: Number(params.id),
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: PoemLikeSchema,
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
			({ auth, params, body }) => {
				return services.commentPoem({
					userId: auth.clientId,
					poemId: params.id,
					content: body.content,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					content: t.String(),
				}),
				response: {
					200: t.Object({
						id: idSchema,
						content: t.String(),
						userId: idSchema,
						poemId: idSchema,
						createdAt: t.Date(),
					}),
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
			({ auth, params }) => {
				return services.deleteComment({
					userId: auth.clientId,
					commentId: params.id,
				});
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
export const interactionsCommandsRouter = createInteractionsCommandsRouter(
	commandsRouterServices,
);
