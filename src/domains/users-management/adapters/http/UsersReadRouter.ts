import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@root/generic-subdomains/authentication/adapters/http/AuthPlugin';

import {
	FullUserSchema,
	UserPublicProfileSchema,
	UserPrivateProfileSchema,
	idSchema,
} from '../schemas/index';

import { QueriesRepository } from '../../infra/read-repository/repository';

import {
	fetchUserFactory,
	getPublicProfileFactory,
	getPrivateProfileFactory,
} from '../../queries/use-cases/index';

import type {
	FullUser,
	PrivateProfile,
	PublicProfile,
	userRole,
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
}
export function createUsersReadRouter(services: UsersReadRouterServices) {
	return new Elysia({ prefix: '/users' })
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
};

export const readUsersRouter = createUsersReadRouter(services);
