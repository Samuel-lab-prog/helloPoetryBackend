import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRepository } from '../../ports/Commands';
import type { NotificationsSutMocks } from './SutMocks';
import { givenResolved } from '@GenericSubdomains/utils/testUtils';

import {
	DEFAULT_USER_ID,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
	DEFAULT_NOTIFICATION_ID,
	DEFAULT_PAGE,
	DEFAULT_USER_NICKNAME,
	DEFAULT_NOTIFICATION_TYPE,
	DEFAULT_PERFORMER_USER_ID,
} from './Constants';
import type { Notification, NotificationPage } from '../../ports/Models';
import type { AppErrorCode } from '@GenericSubdomains/utils/appError';

export type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersPublicContract['selectUserBasicInfo']>>
>;

export type InsertNotificationOverride = Partial<
	Awaited<ReturnType<CommandsRepository['insertNotification']>>['data']
>;

export function givenUser(
	usersContract: NotificationsSutMocks['usersContract'],
	overrides: UserBasicInfoOverride = {},
) {
	givenResolved(usersContract, 'selectUserBasicInfo', {
		exists: true,
		id: DEFAULT_USER_ID,
		role: DEFAULT_USER_ROLE,
		status: DEFAULT_USER_STATUS,
		nickname: DEFAULT_USER_NICKNAME,
		...overrides,
	});
}

export function givenNotificationInserted(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	overrides: InsertNotificationOverride = {},
) {
	const aggregatedCount =
		overrides?.aggregatedCount !== undefined
			? overrides.aggregatedCount + 1
			: 1;

	givenResolved(commandsRepository, 'insertNotification', {
		ok: true,
		data: {
			id: DEFAULT_NOTIFICATION_ID,
			userId: DEFAULT_USER_ID,
			type: DEFAULT_NOTIFICATION_TYPE,
			actorId: DEFAULT_PERFORMER_USER_ID,
			entityId: 2,
			entityType: 'POEM',
			aggregatedCount,
			data: { someKey: 'someValue' },
			createdAt: new Date(),
			updatedAt: new Date(),
			readAt: null,
			...overrides,
		},
	});
}

export function givenNotificationInsertFailure(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	code: AppErrorCode = 'UNKNOWN',
	message = 'Failed to create notification',
) {
	givenResolved(commandsRepository, 'insertNotification', {
		ok: false,
		data: null,
		code,
		message,
	});
}

export type DeleteNotificationOverride = Partial<
	Awaited<ReturnType<CommandsRepository['deleteNotification']>>['data']
>;

export function givenNotificationDeleted(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	overrides: DeleteNotificationOverride = {},
) {
	givenResolved(commandsRepository, 'deleteNotification', {
		ok: true,
		data: {
			id: DEFAULT_NOTIFICATION_ID,
			userId: DEFAULT_USER_ID,
			type: DEFAULT_NOTIFICATION_TYPE,
			actorId: DEFAULT_PERFORMER_USER_ID,
			entityId: 1,
			entityType: 'POEM',
			aggregatedCount: 1,
			data: { someKey: 'someValue' },
			createdAt: new Date(),
			updatedAt: new Date(),
			readAt: null,
			...overrides,
		},
	});
}

export function givenNotificationDeleteFailure(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	code: AppErrorCode = 'UNKNOWN',
	message = 'Failed to delete notification',
) {
	givenResolved(commandsRepository, 'deleteNotification', {
		ok: false,
		data: null,
		code,
		message,
	});
}

export type MarkNotificationAsReadOverride = Partial<
	Awaited<ReturnType<CommandsRepository['markNotificationAsRead']>>['data']
>;

export function givenNotificationMarkedAsRead(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	overrides: MarkNotificationAsReadOverride = {},
) {
	givenResolved(commandsRepository, 'markNotificationAsRead', {
		ok: true,
		data: {
			id: DEFAULT_NOTIFICATION_ID,
			userId: DEFAULT_USER_ID,
			type: DEFAULT_NOTIFICATION_TYPE,
			actorId: DEFAULT_PERFORMER_USER_ID,
			entityId: 1,
			entityType: 'POEM',
			aggregatedCount: 1,
			data: { someKey: 'someValue' },
			createdAt: new Date(),
			updatedAt: new Date(),
			readAt: null,
			...overrides,
		},
	});
}

export function givenMarkNotificationAsReadFailure(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	code: AppErrorCode = 'UNKNOWN',
	message = 'Failed to mark notification as read',
) {
	givenResolved(commandsRepository, 'markNotificationAsRead', {
		ok: false,
		data: null,
		code,
		message,
	});
}

export type NotificationOverride = Partial<Notification>;

export function givenNotificationFound(
	queriesRepository: NotificationsSutMocks['queriesRepository'],
	overrides: NotificationOverride = {},
) {
	givenResolved(queriesRepository, 'selectNotificationById', {
		id: DEFAULT_NOTIFICATION_ID,
		userId: DEFAULT_USER_ID,
		type: DEFAULT_NOTIFICATION_TYPE,
		actorId: DEFAULT_PERFORMER_USER_ID,
		entityId: 1,
		entityType: 'POEM',
		aggregatedCount: 1,
		data: { someKey: 'someValue' },
		createdAt: new Date(),
		updatedAt: new Date(),
		readAt: null,
		...overrides,
	});
}

export function givenNotificationNotFound(
	queriesRepository: NotificationsSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'selectNotificationById', null);
}

export function givenUserNotifications(
	queriesRepository: NotificationsSutMocks['queriesRepository'],
	page: NotificationPage = DEFAULT_PAGE,
) {
	givenResolved(queriesRepository, 'selectUserNotifications', page);
}

export function givenAllNotificationsMarkedAsRead(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'markAllAsRead', {
		ok: true,
		data: undefined,
	});
}
// now failure case
export function givenMarkAllAsReadFailure(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	code: AppErrorCode = 'UNKNOWN',
	message = 'Failed to mark all notifications as read',
) {
	givenResolved(commandsRepository, 'markAllAsRead', {
		ok: false,
		data: null,
		code,
		message,
	});
}
