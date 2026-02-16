import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema } from '@SharedKernel/Schemas';
import { NotificationSchema } from '../ports/schemas/Notification';
import type { NotificationsCommandsServices } from '../ports/Commands';

export function createNotificationsCommandsRouter(
	services: NotificationsCommandsServices,
) {
	return new Elysia({ prefix: '/notifications' })
		.use(AuthPlugin)
		.patch(
			'/:id/read',
			({ params, auth }) => {
				return services.markAsRead({
					notificationId: params.id,
					userId: auth.clientId,
				});
			},
			{
				params: t.Object({ id: idSchema }),
				response: {
					200: NotificationSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Mark Notification as Read',
					description:
						'Marks a specific notification as read for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		)
		.delete(
			'/:id',
			({ params, auth }) => {
				return services.deleteNotification({
					notificationId: params.id,
					userId: auth.clientId,
				});
			},
			{
				params: t.Object({ id: idSchema }),
				response: {
					200: NotificationSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Delete Notification',
					description:
						'Soft deletes a notification for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		);
}
