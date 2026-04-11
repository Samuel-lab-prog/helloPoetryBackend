import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema } from '@SharedKernel/Schemas';
import {
	userSanctionStatusResponseSchema,
	userSanctionsResponseSchema,
} from '../ports/schemas/Index';
import type { QueriesRouterServices } from '../ports/queries';
import { appErrorSchema } from '@GenericSubdomains/utils/AppError';

export function createModerationQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/moderation' })
		.use(AuthPlugin)
		.get(
			'/users/:id/sanctions',
			({ auth, params }) => {
				return services.getUserSanctions({
					userId: params.id,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: userSanctionsResponseSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get User Sanctions',
					description: 'Returns all sanctions for a user.',
					tags: ['Moderation'],
				},
			},
		)
		.get(
			'/users/:id/sanctions/active',
			({ auth, params }) => {
				return services.getUserSanctionStatus({
					userId: params.id,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: userSanctionStatusResponseSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get Active User Sanctions',
					description: 'Returns active ban/suspension for a user.',
					tags: ['Moderation'],
				},
			},
		);
}
