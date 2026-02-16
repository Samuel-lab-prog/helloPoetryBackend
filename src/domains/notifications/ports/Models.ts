import {
	DeleteNotificationResultSchema,
	NotficationsPageSchema,
	NotificationCreateResultSchema,
	NotificationSchema,
	NotificationTypeSchema,
	UpdateNotificationresultSchema,
} from './schemas/Notification';

export type NotificationType = (typeof NotificationTypeSchema)['static'];
export type Notification = (typeof NotificationSchema)['static'];
export type NotificationCreateResult =
	(typeof NotificationCreateResultSchema)['static'];
export type NotificationUpdateResult =
	(typeof UpdateNotificationresultSchema)['static'];
export type NotificationDeleteResult =
	(typeof DeleteNotificationResultSchema)['static'];

export type NotificationPage = (typeof NotficationsPageSchema)['static'];
