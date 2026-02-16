import type { InputJsonValue } from '@PrismaGenerated/internal/prismaNamespace';
import type {
	NotificationCreateResult,
	NotificationDeleteResult,
	NotificationType,
	NotificationUpdateResult,
} from './Models';
import type { CommandResult } from '@SharedKernel/Types';

export type CreateNotificationParams = {
	userId: number; // Who will receive the notification
	type: NotificationType;
	title: string; // Short title for the notification
	body: string; // Detailed message for the notification
	actorId?: number; // Who triggered the notification (could be null for system-generated notifications)
	entityId?: number; // ID of the related entity (e.g., POEM, COMMENT). Optional, but can be used for aggregation.
	entityType?: string; // Type of the related entity (e.g., 'POEM', 'COMMENT'). Optional, but can be used for aggregation.
	data?: InputJsonValue; // Additional data relevant to the notification (e.g., { commentSnippet: 'Hello World' })
	aggregatedCount?: number; // initial count for aggregation, default is 1
	aggregateWindowMinutes?: number; // time window in minutes for aggregation. If specified, the system will try to find an existing notification of the same type and entity within this time window to aggregate with.
};

export type MarkNotificationAsReadParams = {
	notificationId: number;
	userId: number;
};

export type DeleteNotificationParams = {
	notificationId: number;
	userId: number;
};

export interface NotificationsCommandsServices {
	markAsRead: (
		params: MarkNotificationAsReadParams,
	) => Promise<NotificationUpdateResult>;

	deleteNotification: (
		params: DeleteNotificationParams,
	) => Promise<NotificationDeleteResult>;

	createNotification: (
		params: CreateNotificationParams,
	) => Promise<NotificationCreateResult>;
}

export interface CommandsRepository {
	insertNotification(
		notification: CreateNotificationParams,
	): Promise<CommandResult<NotificationCreateResult>>;

	markNotificationAsRead(
		notificationId: number,
		userId: number,
	): Promise<CommandResult<NotificationUpdateResult>>;

	deleteNotification(
		notificationId: number,
		userId: number,
	): Promise<CommandResult<NotificationDeleteResult>>;
}
