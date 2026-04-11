import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema } from '@SharedKernel/Schemas';
import {
	suspendedUserResponseSchema,
	bannedUserResponseSchema,
	sanctionReasonSchema,
	suspensionDurationDaysSchema,
	ModeratePoemBodySchema,
	ModeratePoemResultSchema,
} from '../ports/schemas/Index';
import { type CommandsRouterServices } from '../ports/commands';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';

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
					requesterStatus: auth.clientStatus,
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
					requesterStatus: auth.clientStatus,
					userId: params.id,
					reason: body.reason,
					durationDays: body.durationDays,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					reason: sanctionReasonSchema,
					durationDays: t.Optional(suspensionDurationDaysSchema),
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
		)
		.patch(
			'/poems/:id',
			({ auth, params, body }) => {
				return services.moderatePoem({
					poemId: params.id,
					moderationStatus: body.moderationStatus,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				response: {
					200: ModeratePoemResultSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				body: ModeratePoemBodySchema,
				detail: {
					summary: 'Moderate Poem',
					description:
						'Updates the moderation status of a poem for moderators or admins.',
					tags: ['Moderation'],
				},
			},
		);
}
