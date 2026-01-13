import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@root/generic-subdomains/authentication/adapters/http/AuthPlugin';

import {
	FullUserSchema,
	UserPublicProfileSchema,
	UserPrivateProfileSchema,
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

interface UsersReadControllerServices {
	fetchUser: (params: {
		targetId: number;
		requesterId: number;
		requesterRole: userRole;
	}) => Promise<FullUser>;
	fetchPublicProfile: (
		id: number,
		requesterId?: number,
	) => Promise<PublicProfile>;
	fetchPrivateProfile: (id: number) => Promise<PrivateProfile>;
}
export function createUsersReadRouter(services: UsersReadControllerServices) {
	return new Elysia({ prefix: '/users' })
		.get(
			'/:id/profile',
			({ params, query }) => {
				return services.fetchPublicProfile(params.id, query.requesterId);
			},
			{
				response: {
					200: UserPublicProfileSchema,
					401: appErrorSchema,
					422: appErrorSchema,
					500: appErrorSchema,
				},
				params: t.Object({
					id: t.Number(),
				}),
				query: t.Object({
					requesterId: t.Optional(t.Number()),
				}),
				detail: {
					summary: 'Fetch User Public Profile',
					description: 'Fetches a user public profile by their ID.',
					tags: ['Users Management'],
				},
			},
		)
		.use(AuthPlugin)
		.get(
			'/me',
			({ store }) => {
				return services.fetchPrivateProfile(store.clientId!);
			},
			{
				response: {
					200: UserPrivateProfileSchema,
					401: appErrorSchema,
					422: appErrorSchema,
					500: appErrorSchema,
				},
				detail: {
					summary: 'Fetch My Private Profile',
					description: 'Fetches the private profile of the authenticated user.',
					tags: ['Users Management'],
				},
			},
		)
		.get(
			'/:id',
			({ params, store }) => {
				return services.fetchUser({
					targetId: params.id,
					requesterId: store.clientId!,
					requesterRole: store.clientRole!,
				});
			},
			{
				response: {
					200: FullUserSchema,
					401: appErrorSchema,
					422: appErrorSchema,
					500: appErrorSchema,
				},
				params: t.Object({
					id: t.Number(),
				}),
				detail: {
					summary: 'Fetch User',
					description: 'Fetches a user by their ID.',
					tags: ['Users Management'],
				},
			},
		);
}

const services: UsersReadControllerServices = {
	fetchUser: fetchUserFactory({ userReadRepository: QueriesRepository }),
	fetchPublicProfile: getPublicProfileFactory({
		userReadRepository: QueriesRepository,
	}),
	fetchPrivateProfile: getPrivateProfileFactory({
		userReadRepository: QueriesRepository,
	}),
};

export const readUsersRouter = createUsersReadRouter(services);
