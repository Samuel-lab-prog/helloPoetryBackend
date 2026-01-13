import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';

import { FullUserSchema } from '../schemas/FullUser';
import { UserPublicProfileSchema } from '../schemas/UserPublicProfile';

import { QueriesRepository } from '../../infra/read-repository/repository';
import { fetchUserFactory } from '../../queries/use-cases/GetUser';
import { getPublicProfileFactory } from '../../queries/use-cases/GetPublicProfile';

import type { FullUser } from '../../queries/read-models/FullUser';
import type { PublicProfile } from '../../queries/read-models/PublicProfile';

interface UsersReadControllerServices {
	fetchUser: (id: number) => Promise<FullUser>;
	fetchUserProfile: (
		id: number,
		requesterId?: number,
	) => Promise<PublicProfile>;
}
export function createUsersReadRouter(services: UsersReadControllerServices) {
	return new Elysia().group('/users', (app) =>
		app
			.get(
				'/:id',
				({ params }) => {
					return services.fetchUser(params.id);
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
						tags: ['Users Mnanagement'],
					},
				},
			)
			.get(
				'/:id/profile',
				({ params, query }) => {
					return services.fetchUserProfile(params.id, query.requesterId);
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
						tags: ['Users Mananagement'],
					},
				},
			),
	);
}

const services: UsersReadControllerServices = {
	fetchUser: fetchUserFactory({ userReadRepository: QueriesRepository }),
	fetchUserProfile: getPublicProfileFactory({
		userReadRepository: QueriesRepository,
	}),
};

export const readUsersRouter = createUsersReadRouter(services);
