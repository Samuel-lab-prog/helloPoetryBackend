/* eslint-disable max-lines-per-function */
import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';

import {
	commandsRouterServices,
	type CommandsRouterServices,
} from './Services';
import { idSchema } from '@SharedKernel/Schemas';
import { SendFriendRequestSchema } from '../../schemas/Index';

export function createFriendsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/friends' })
		.use(AuthPlugin)
		.post(
			'/:id',
			async ({ auth, params, set }) => {
				const result = await services.sendFriendRequest({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
				set.status = 201;
				return result;
			},
			{
				response: {
					201: SendFriendRequestSchema,
					409: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 201,
				detail: {
					summary: 'Send Friend Request',
					description:
						'Sends a friend request from the authenticated user to the target user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/accept/:id',
			({ auth, params }) => {
				return services.acceptFriendRequest({
					requesterId: params.id,
					addresseeId: auth.clientId,
				});
			},
			{
				response: {
					200: SendFriendRequestSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Accept Friend Request',
					description:
						'Accepts a friend request from the specified user to the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/reject/:id',
			({ auth, params }) => {
				return services.rejectFriendRequest({
					requesterId: params.id,
					addresseeId: auth.clientId,
				});
			},
			{
				response: {
					200: SendFriendRequestSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Reject Friend Request',
					description:
						'Rejects a friend request from the specified user to the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/block/:id',
			({ auth, params }) => {
				return services.blockFriendRequest({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: SendFriendRequestSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Block Friend Request',
					description:
						'Blocks a friend request from the specified user to the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		)
		.delete(
			'/delete/:id',
			({ auth, params }) => {
				return services.deleteFriend({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: t.Object({
						requesterId: idSchema,
						addresseeId: idSchema,
					}),
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Delete Friend',
					description:
						'Deletes the friendship between the authenticated user and the specified user.',
					tags: ['Friends Management'],
				},
			},
		)
		.delete(
			'/cancel/:id',
			({ auth, params }) => {
				return services.cancelFriendRequest({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: SendFriendRequestSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Cancel Friend Request',
					description:
						'Cancels a previously sent friend request from the authenticated user to the specified user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/unblock/:id',
			({ auth, params }) => {
				return services.unblockFriendRequest({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: SendFriendRequestSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Unblock User',
					description:
						'Unblocks a previously blocked user for the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		);
}

export const friendsCommandsRouter = createFriendsCommandsRouter(
	commandsRouterServices,
);
