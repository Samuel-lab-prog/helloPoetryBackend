import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';

import {
	commandsRouterServices,
	type CommandsRouterServices,
} from './Services';
import { idSchema } from '../../schemas/parameters/IdSchema';

export function createFriendsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/friends' }).use(AuthPlugin).post(
		'/:id',
		({ auth, params }) => {
			return services.sendFriendRequest({
				requesterId: auth.clientId,
				targetUserId: params.id,
			});
		},
		{
			response: {
				201: t.Object({ id: idSchema }),
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
	);
}
export const friendsCommandsRouter = createFriendsCommandsRouter(
	commandsRouterServices,
);
