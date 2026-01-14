import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@root/generic-subdomains/authentication/adapters/http/auth-plugin/AuthPlugin';

import { CreateUserSchema, UpdateUserSchema, idSchema } from '../../schemas';

import { type UsersCommandsServices, usersCommandsServices } from './Services';

export function createUsersCommandsRouter(services: UsersCommandsServices) {
	return new Elysia({ prefix: '/users' })
		.post(
			'/',
			({ body }) => {
				return services.createUser(body);
			},
			{
				body: CreateUserSchema,
				response: {
					201: t.Object({ id: idSchema }),
					409: appErrorSchema,
				},
				detail: {
					summary: 'Create User',
					description: 'Creates a new user.',
					tags: ['Users Management'],
				},
			},
		)
		.use(AuthPlugin)
		.patch(
			'/:id',
			({ params, body, auth }) => {
				return services.updateUser(auth.clientId, params.id, body);
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: UpdateUserSchema,
				response: {
					200: t.Object({ id: idSchema }),
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Update User',
					description: 'Updates user data.',
					tags: ['Users Management'],
				},
			},
		);
}
export const userCommandsRouter = createUsersCommandsRouter(
	usersCommandsServices,
);
