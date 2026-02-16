import { t } from 'elysia';
import {
  DateSchema,
  idSchema,
  NullableDateSchema,
} from '@SharedKernel/Schemas';
import type { EventName } from '@SharedKernel/events/EventBus';

const notificationTypes = [
  'POEM_COMMENT_CREATED',
	'NEW_FRIEND',
	'NEW_FRIEND_REQUEST',
	'POEM_LIKED',
	'POEM_COMMENT_REPLIED',
	'POEM_DEDICATED',
] as const satisfies readonly EventName[];

export const NotificationTypeSchema = t.UnionEnum(notificationTypes);

export const NotificationSchema = t.Object({
  id: idSchema,
  userId: idSchema,
  type: NotificationTypeSchema,
  actorId: t.Nullable(idSchema),
  entityId: t.Nullable(idSchema),
  entityType: t.Nullable(t.String()),
  aggregatedCount: t.Number(),           // contador agregado
  data: t.Nullable(t.Any()),
  createdAt: DateSchema,
  updatedAt: DateSchema,
  readAt: NullableDateSchema,
});

export const NotificationsPageSchema = t.Object({
  notifications: t.Array(NotificationSchema),
  hasMore: t.Boolean(),
  nextCursor: t.Optional(t.Number()),
});

export const NotificationCreateResultSchema = NotificationSchema;
export const UpdateNotificationResultSchema = NotificationSchema;
export const DeleteNotificationResultSchema = NotificationSchema;
