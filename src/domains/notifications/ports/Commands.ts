import type {
	NotificationCreateResult,
	NotificationDeleteResult,
	NotificationType,
	NotificationUpdateResult,
} from './Models';
import type { CommandResult } from '@SharedKernel/Types';

export type CreateNotificationParams = {
	userId: number;
	type: NotificationType;
	title: string;
	body: string;
	data?: Record<string, unknown>;
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
	) => Promise<NotificationCreateResult>;
	deleteNotification?: (
		params: DeleteNotificationParams,
	) => Promise<NotificationDeleteResult>;
}

export interface CommandsRepository {
	insertNotification(
		notification: CreateNotificationParams,
	): Promise<CommandResult<NotificationCreateResult>>;

	markNotificationAsRead(
		notificationId: number,
		userId: number,
	): Promise<CommandResult<NotificationUpdateResult>>;

	softDeleteNotification(
		notificationId: number,
		userId: number,
	): Promise<CommandResult<NotificationDeleteResult>>;
}
