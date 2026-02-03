import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { appErrorSchema } from '@AppError';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

import { CreatePoemBodySchema } from '../../schemas/CreatePoemSchema';
import {
	type CommandsRouterServices,
	commandsRouterServices,
} from './Services';
import { PoemCreationResultSchema } from '../../schemas/PoemCreationResultSchema';
import { UpdatePoemBodySchema } from '../../schemas/UpdatePoemSchema';
import { idSchema } from '@SharedKernel/Schemas';

export function createPoemsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/poems' })
		.use(AuthPlugin)
		.post(
			'/',
			async ({ auth, body, set }) => {
				const rs = await services.createPoem({
					data: { ...body, authorId: auth.clientId },
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus as UserStatus,
						requesterRole: auth.clientRole as UserRole,
					},
				});
				set.status = 201;
				return rs;
			},
			{
				response: {
					201: PoemCreationResultSchema,
					409: appErrorSchema,
				},
				body: CreatePoemBodySchema,
				detail: {
					summary: 'Create Poem',
					description: 'Creates a new poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.put(
			'/:id',
			({ auth, body, params }) => {
				return services.updatePoem({
					data: body,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus as UserStatus,
						requesterRole: auth.clientRole as UserRole,
					},
					poemId: params.id,
				});
			},
			{
				response: {
					200: UpdatePoemBodySchema, // TODO: Define UpdatePoemResponseSchema
					404: appErrorSchema,
					409: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				body: UpdatePoemBodySchema, // TODO: Define UpdatePoemBodySchema
				detail: {
					summary: 'Update Poem',
					description:
						'Updates an existing poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		);
}

export const poemsCommandsRouter = createPoemsCommandsRouter(
	commandsRouterServices,
);
