import type { Notification } from './Models';

export type GetUserNotificationsParams = {
	userId: number;
	onlyUnread?: boolean;
	limit?: number;
	offset?: number;
};

export type GetNotificationByIdParams = {
	userId: number;
	notificationId: number;
};

export interface NotificationsQueriesServices {
	getUserNotifications: (
		params: GetUserNotificationsParams,
	) => Promise<Notification[]>;
	getNotificationById: (
		params: GetNotificationByIdParams,
	) => Promise<Notification>;
}

export interface QueriesRepository {
	findUserNotifications: (
		userId: number,
		options?: { onlyUnread?: boolean; limit?: number; offset?: number },
	) => Promise<Notification[]>;

	findNotificationById: (
		notificationId: number,
		userId: number,
	) => Promise<Notification | null>;
}
