import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema } from '@SharedKernel/Schemas';

import {
	CreateUserSchema,
	UpdateUserBodySchema,
	FullUserSchema,
} from '../../ports/schemas/Index';

import { type UsersCommandsServices } from '../../ports/commands/Services';

export function createUsersCommandsRouter(services: UsersCommandsServices) {
	return new Elysia({ prefix: '/users' })
		.post(
			'/',
			async ({ body, set }) => {
				const result = await services.createUser({ data: body });
				set.status = 201;
				return result;
			},
			{
				body: CreateUserSchema,
				response: {
					201: FullUserSchema,
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
				return services.updateUser({
					requesterId: auth.clientId,
					requesterStatus: auth.clientStatus,
					targetId: params.id,
					data: body,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: UpdateUserBodySchema,
				response: {
					200: FullUserSchema,
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
