import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

export const NotificationTypeSchema = t.UnionEnum([
	'POEM_COMMENT_CREATED',
	'POEM_LIKED',
	'USER_FOLLOWED',
	'FRIEND_REQUEST_ACCEPTED',
	'FRIEND_REQUEST_RECEIVED',
]);

export const NotificationSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	type: NotificationTypeSchema,
	title: t.String(),
	body: t.String(),
	data: t.Optional(t.Any()),
	createdAt: DateSchema,
	readAt: t.Nullable(DateSchema),
});

export const NotificationCreateResultSchema = NotificationSchema;
export const UpdateNotificationresultSchema = NotificationSchema;
export const DeleteNotificationResultSchema = NotificationSchema;
