import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';
import { idSchema, NonNegativeIntegerSchema } from '@SharedKernel/Schemas';

import {
	NotificationSchema,
	NotficationsPageSchema,
} from '../ports/schemas//Notification';
import { type NotificationsQueriesServices } from '../ports/Queries';

export function createNotificationsQueriesRouter(
	services: NotificationsQueriesServices,
) {
	return new Elysia({ prefix: '/notifications' })
		.use(AuthPlugin)
		.get(
			'/',
			({ query, auth }) => {
				return services.getUserNotifications({
					userId: auth.clientId,
					onlyUnread: query.onlyUnread,
					limit: query.limit,
					nextCursor: query.nextCursor,
				});
			},
			{
				query: t.Partial(
					t.Object({
						onlyUnread: t.Boolean(),
						limit: NonNegativeIntegerSchema,
						nextCursor: idSchema,
					}),
				),
				response: {
					200: NotficationsPageSchema,
					403: appErrorSchema,
				},
				detail: {
					summary: 'Get User Notifications',
					description:
						'Lists notifications for the authenticated user, optionally filtering unread only.',
					tags: ['Notifications'],
				},
			},
		)
		.get(
			'/:id',
			({ params, auth }) => {
				return services.getNotificationById({
					userId: auth.clientId,
					notificationId: params.id,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: NotificationSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get Notification By ID',
					description:
						'Returns a single notification for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		);
}
