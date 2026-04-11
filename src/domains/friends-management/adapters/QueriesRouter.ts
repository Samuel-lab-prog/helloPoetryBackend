import { Elysia } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { FriendRequestsByUserSchema } from '../ports/schemas/Index';
import { type QueriesRouterServices } from '../ports/queries';

export function createFriendsQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/friends' }).use(AuthPlugin).get(
		'/requests',
		({ auth }) => {
			return services.getMyFriendRequests({
				requesterId: auth.clientId,
			});
		},
		{
			response: {
				200: FriendRequestsByUserSchema,
			},
			detail: {
				summary: 'Get My Friend Requests',
				description:
					'Returns friend requests sent and received by the authenticated user.',
				tags: ['Friends Management'],
			},
		},
	);
}
