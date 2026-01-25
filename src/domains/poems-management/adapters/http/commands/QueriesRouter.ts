import { Elysia } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '../../schemas';
import { CreatePoemBodySchema } from '../../schemas/CreatePoemSchema';

import {
	type CommandsRouterServices,
	commandsRouterServices,
} from './Services';
import { appErrorSchema } from '@AppError';

export function createPoemsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/poems' }).use(AuthPlugin).post(
		'/',
		({ auth, body }) => {
			return services.createPoem({
				data: body,
				meta: {
					requesterId: auth.clientId,
					requesterStatus: auth.clientStatus as
						| 'active'
						| 'suspended'
						| 'banned',
				},
			});
		},
		{
			response: {
				201: idSchema,
				409: appErrorSchema,
			},
			body: CreatePoemBodySchema,
			detail: {
				summary: 'Create Poem',
				description: 'Creates a new poem authored by the authenticated user.',
				tags: ['Poems Management'],
			},
		},
	);
}

export const poemsCommandsRouter = createPoemsCommandsRouter(
	commandsRouterServices,
);
