import { t } from 'elysia';
import {
	DateSchema,
	idSchema,
	NullableDateSchema,
} from '@SharedKernel/Schemas';
import type { EventName } from '@SharedKernel/events/EventBus';

const notificationTypes = [
	'poem.comment.created',
	'user.followed',
] as const satisfies readonly EventName[];

export const NotificationTypeSchema = t.UnionEnum(notificationTypes);

export const NotificationSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	type: NotificationTypeSchema,
	title: t.String(),
	body: t.String(),
	data: t.Optional(t.Any()),
	createdAt: DateSchema,
	readAt: NullableDateSchema,
});

export const NotficationsPageSchema = t.Object({
	notifications: t.Array(NotificationSchema),
	hasMore: t.Boolean(),
	nextCursor: t.Optional(t.Number()),
});

export const NotificationCreateResultSchema = NotificationSchema;
export const UpdateNotificationresultSchema = NotificationSchema;
export const DeleteNotificationResultSchema = NotificationSchema;
