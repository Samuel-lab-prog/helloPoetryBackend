import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema } from '@SharedKernel/Schemas';

import {
	UserPublicProfileSchema,
	UsersPageSchema,
	orderDirectionSchema,
	orderUsersBySchema,
	paginationLimitSchema,
	UserPrivateProfileSchema,
} from '../../ports/schemas/Index';

import {
	usersQueriesServices,
	type UsersQueriesRouterServices,
} from './Services';

// eslint-disable-next-line max-lines-per-function
export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	return new Elysia({ prefix: '/users' })
		.use(AuthPlugin)
		.get(
			'/',
			({ query, auth }) => {
				const { limit, cursor, orderBy, orderDirection, searchNickname } =
					query;
				return services.getUsers({
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
				return services.getPublicProfile({
					id: params.id,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				response: {
					200: UserPublicProfileSchema,
					404: appErrorSchema,
					422: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),

				detail: {
					summary: 'Get User Public Profile',
					description: 'Returns a user public profile by their ID.',
					tags: ['Users Management'],
				},
			},
		)
		.get(
			'/me',
			({ auth }) => {
				return services.getPrivateProfile({
					requesterId: auth.clientId,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				response: {
					200: UserPrivateProfileSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get My Private Profile',
					description: 'Returns the private profile of the authenticated user.',
					tags: ['Users Management'],
				},
			},
		);
}

export const userQueriesRouter = createUsersReadRouter(usersQueriesServices);
