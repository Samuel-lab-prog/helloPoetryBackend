import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';

import { queriesRouterServices, type QueriesRouterServices } from './Services';
import { idSchema } from '@SharedKernel/Schemas';
import { FriendshipStatusSchema } from '../../schemas/Index';

export function createFriendsQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/friends' }).use(AuthPlugin).get(
		'/:id',
		({ auth, params }) => {
			return services.getFriendshipStatus({
				viewerId: auth.clientId,
				targetUserId: params.id,
			});
		},
		{
			response: {
				200: FriendshipStatusSchema,
				409: appErrorSchema,
			},
			params: t.Object({
				id: idSchema,
			}),
			status: 200,
			detail: {
				summary: 'Get Friendship Status',
				description:
					'Retrieves the friendship status between the authenticated user and the target user.',
				tags: ['Friends Management'],
			},
		},
	);
}

export const friendsQueriesRouter = createFriendsQueriesRouter(
	queriesRouterServices,
);
