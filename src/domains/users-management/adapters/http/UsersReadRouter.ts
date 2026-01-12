import { Elysia, t } from 'elysia';
import { SetupPlugin } from '@SetupPlugin';
import { appErrorSchema } from '@AppError';
import { loginSchema } from '@GeneralSchemas';

import { FullUserSchema } from '../schemas/FullUser';
import type { FullUser } from '../../queries/read-models/FullUser';
import { QueriesRepository } from '../../infra/read-repository/repository';
import { fetchUserFactory } from '../../queries/use-cases/GetUser';

interface UsersReadControllerServices {
	fetchUser: (id: number) => Promise<FullUser>; // To be implemented
}
export function createUsersReadRouter(services: UsersReadControllerServices) {
	return new Elysia().group('/users', (app) =>
		app.use(SetupPlugin).get(
			'/:id',
			({ params }) => {
				return services.fetchUser(params.id);
			},
			{
				body: loginSchema,
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
		),
	);
}

const services: UsersReadControllerServices = {
	fetchUser: fetchUserFactory({ userReadRepository: QueriesRepository }),
};

export const readUsersRouter = createUsersReadRouter(services);
