import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@root/generic-subdomains/authentication/adapters/http/AuthPlugin';

import {
	FullUserSchema,
	UserPublicProfileSchema,
	UserPrivateProfileSchema,
	idSchema,
	UsersPageSchema,
	orderDirectionSchema,
	orderUsersBySchema,
	paginationLimitSchema,
} from '../schemas/index';

import { QueriesRepository } from '../../infra/read-repository/repository';

import {
	fetchUserFactory,
	getPublicProfileFactory,
	getPrivateProfileFactory,
	getUsersFactory,
} from '../../queries/use-cases/index';

import type {
	FullUser,
	PrivateProfile,
	PublicProfile,
	userRole,
	SelectUsersPage,
} from '../../queries/read-models/index';

interface UsersReadRouterServices {
	getUser: (params: {
		targetId: number;
		requesterId: number;
		requesterRole: userRole;
	}) => Promise<FullUser>;
	getPublicProfile: (
		id: number,
		requesterId?: number,
	) => Promise<PublicProfile>;
	getPrivateProfile: (id: number) => Promise<PrivateProfile>;
	getUsers: (params: {
		navigationOptions: {
			limit: number;
			cursor?: number;
		};
		sortOptions: {
			orderBy: 'createdAt' | 'nickname' | 'id';
			orderDirection: 'asc' | 'desc';
		};
		nicknameSearch?: string;
	}) => Promise<SelectUsersPage>;
}

export function createUsersReadRouter(services: UsersReadRouterServices) {
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
		.get(
			'/:id/profile',
			({ params, query }) => {
				return services.getPublicProfile(params.id, query.requesterId);
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
				query: t.Object({
					requesterId: t.Optional(idSchema),
				}),
				detail: {
					summary: 'Get User Public Profile',
					description: 'Returns a user public profile by their ID.',
					tags: ['Users Management'],
				},
			},
		)
		.use(AuthPlugin)
		.get(
			'/me',
			({ store }) => {
				return services.getPrivateProfile(store.clientId);
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
			({ params, store }) => {
				return services.getUser({
					targetId: params.id,
					requesterId: store.clientId!,
					requesterRole: store.clientRole as userRole,
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

const services: UsersReadRouterServices = {
	getUser: fetchUserFactory({ userReadRepository: QueriesRepository }),
	getPublicProfile: getPublicProfileFactory({
		userReadRepository: QueriesRepository,
	}),
	getPrivateProfile: getPrivateProfileFactory({
		userReadRepository: QueriesRepository,
	}),
	getUsers: getUsersFactory({
		userReadRepository: QueriesRepository,
	}),
};

export const readUsersRouter = createUsersReadRouter(services);
