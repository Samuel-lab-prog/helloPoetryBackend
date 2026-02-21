/* eslint-disable max-lines-per-function */
import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { appErrorSchema } from '@AppError';
import { idSchema } from '@SharedKernel/Schemas';

import {
	CreatePoemResultSchema,
	CreatePoemBodySchema,
	UpdatePoemBodySchema,
	UpdatePoemResultSchema,
} from '../ports/schemas/Index';

import { type CommandsRouterServices } from '../ports/Commands';

export function createPoemsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/poems' })
		.use(AuthPlugin)
		.post(
			'/',
			async ({ auth, body, set }) => {
				const rs = await services.createPoem({
					data: body,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
				set.status = 201;
				return rs;
			},
			{
				response: {
					201: CreatePoemResultSchema,
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
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
					poemId: params.id,
				});
			},
			{
				response: {
					200: UpdatePoemResultSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				body: UpdatePoemBodySchema,
				detail: {
					summary: 'Update Poem',
					description:
						'Updates an existing poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.delete(
			'/:id',
			({ auth, params }) => {
				return services.deletePoem({
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
					poemId: params.id,
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Delete Poem',
					description:
						'Deletes an existing poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.post(
			'/:id/save',
			({ auth, params }) => {
				return services.savePoem({
					poemId: params.id,
					userId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Save Poem',
					description:
						"Saves a poem to the authenticated user's saved poems list.",
					tags: ['Poems Management'],
				},
			},
		)
		.delete(
			'/:id/save',
			({ auth, params }) => {
				return services.removeSavedPoem({
					poemId: params.id,
					userId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Remove Saved Poem',
					description:
						"Removes a poem from the authenticated user's saved poems list.",
					tags: ['Poems Management'],
				},
			},
		);
}
