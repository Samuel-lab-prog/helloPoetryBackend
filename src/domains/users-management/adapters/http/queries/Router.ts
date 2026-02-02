import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';

import {
	FullUserSchema,
	UserPublicProfileSchema,
	idSchema,
	UsersPageSchema,
	orderDirectionSchema,
	orderUsersBySchema,
	paginationLimitSchema,
	UserPrivateProfileSchema,
} from '../../schemas/Index';

import {
	usersQueriesServices,
	type UsersQueriesRouterServices,
} from './Services';
import type { UserRole } from '@SharedKernel/Enums';

// eslint-disable-next-line max-lines-per-function
export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	return new Elysia({ prefix: '/users' })
		.get(
			'/',
			({ query }) => {
				const { limit, cursor, orderBy, orderDirection, searchNickname } =
					query;
				return services.getUsers({
					navigationOptions: {
						limit,
						cursor,
					},
					sortOptions: {
						orderBy,
						orderDirection,
					},
					nicknameSearch: searchNickname,
				});
			},
			{
				response: {
					200: UsersPageSchema,
				},
				query: t.Object({
					limit: paginationLimitSchema,
					cursor: t.Optional(t.Number()),
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
		.use(AuthPlugin)
		.get(
			'/:id/profile',
			({ params, auth }) => {
				return services.getPublicProfile(params.id, auth.clientId);
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
				return services.getPrivateProfile(auth.clientId);
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
		)
		.get(
			'/:id',
			({ params, auth }) => {
				return services.getUser({
					targetId: params.id,
					requesterId: auth.clientId!,
					requesterRole: auth.clientRole as UserRole,
				});
			},
			{
				response: {
					200: FullUserSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Get User',
					description: 'Returns a user by their ID.',
					tags: ['Users Management'],
				},
			},
		);
}

export const userQueriesRouter = createUsersReadRouter(usersQueriesServices);
