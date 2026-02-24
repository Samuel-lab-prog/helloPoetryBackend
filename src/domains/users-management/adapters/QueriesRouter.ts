import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@GenericSubdomains/utils/appError';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema } from '@SharedKernel/Schemas';

import {
	UserPublicProfileSchema,
	UsersPageSchema,
	orderDirectionSchema,
	orderUsersBySchema,
	paginationLimitSchema,
	UserPrivateProfileSchema,
} from '../ports/schemas/Index';

import { type UsersQueriesRouterServices } from '../ports/Queries';

export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	return new Elysia({ prefix: '/users' })
		.use(AuthPlugin)
		.get(
			'/',
			({ query, auth }) => {
				const { limit, cursor, orderBy, orderDirection, searchNickname } =
					query;
				return services.searchUsers({
					requesterStatus: auth.clientStatus,
					navigationOptions: {
						limit,
						cursor,
					},
					sortOptions: {
						by: orderBy,
						order: orderDirection,
					},
					filterOptions: {
						searchNickname,
					},
				});
			},
			{
				response: {
					200: UsersPageSchema,
				},
				query: t.Object({
					limit: paginationLimitSchema,
					cursor: t.Optional(idSchema),
					orderBy: orderUsersBySchema,
					orderDirection: orderDirectionSchema,
					searchNickname: t.Optional(t.String()),
				}),
				detail: {
					summary: 'Get Users',
					description: 'Returns a paginated list of users.',
					tags: ['Users Management'],
				},
			},
		)
		.get(
			'/:id/profile',
			({ params, auth }) => {
				return services.getProfile({
					id: params.id,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				response: {
					200: t.Union([UserPublicProfileSchema, UserPrivateProfileSchema]),
					404: appErrorSchema,
					422: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),

				detail: {
					summary: 'Get User Profile',
					description:
						'Returns a user profile (public or private) by their ID.',
					tags: ['Users Management'],
				},
			},
		);
}
