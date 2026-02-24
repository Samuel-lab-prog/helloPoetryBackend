import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema } from '@SharedKernel/Schemas';
import {
	suspendedUserResponseSchema,
	bannedUserResponseSchema,
	sanctionReasonSchema,
} from '../ports/schemas/Index';
import { type CommandsRouterServices } from '../ports/Commands';
import { appErrorSchema } from '@GenericSubdomains/utils/appError';

export function createModerationCommandsRouter(
	services: CommandsRouterServices,
) {
	return new Elysia({ prefix: '/moderation' })
		.use(AuthPlugin)
		.post(
			'/ban/:id',
			({ auth, params, body }) => {
				return services.banUser({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					userId: params.id,
					reason: body.reason,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					reason: sanctionReasonSchema,
				}),
				response: {
					200: bannedUserResponseSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Ban User',
					description: 'Bans a user by the authenticated moderator.',
					tags: ['Moderation'],
				},
			},
		)
		.post(
			'/suspend/:id',
			({ auth, params, body }) => {
				return services.suspendUser({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					userId: params.id,
					reason: body.reason,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					reason: sanctionReasonSchema,
				}),
				response: {
					200: suspendedUserResponseSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Suspend User',
					description: 'Suspends a user by the authenticated moderator.',
					tags: ['Moderation'],
				},
			},
		);
}
