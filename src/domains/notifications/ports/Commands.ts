import type { InputJsonValue } from '@PrismaGenerated/internal/prismaNamespace';
import type {
	NotificationCreateResult,
	NotificationDeleteResult,
	NotificationType,
	NotificationUpdateResult,
} from './Models';
import type { CommandResult } from '@SharedKernel/Types';
import type { Entity } from '@SharedKernel/events/EventBus';

export type CreateNotificationParams = {
	userId: number;
	type: NotificationType;
	title: string;
	body: string;
	actorId?: number;
	entityId?: number;

	entityType?: Entity;
	data?: InputJsonValue;
	aggregatedCount?: number;
	aggregateWindowMinutes?: number;
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
