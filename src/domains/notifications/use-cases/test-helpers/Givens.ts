import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRepository } from '../../ports/Commands';
import type { NotificationsSutMocks } from './SutMocks';
import { givenResolved } from '@TestUtils';

import {
	DEFAULT_USER_ID,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
	DEFAULT_NOTIFICATION_ID,
	DEFAULT_PAGE,
} from './Constants';
import type { Notification, NotificationPage } from '../../ports/Models';

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
		...overrides,
	});
}

export function givenNotificationInserted(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	overrides: InsertNotificationOverride = {},
) {
	givenResolved(commandsRepository, 'insertNotification', {
		ok: true,
		data: {
			id: DEFAULT_NOTIFICATION_ID,
			...overrides,
		},
	});
}

export function givenNotificationInsertFailure(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	code = 'UNKNOWN_ERROR',
	message = 'Failed to create notification',
) {
	givenResolved(commandsRepository, 'insertNotification', {
		ok: false,
		code,
		message,
	});
}

export type SoftDeleteNotificationOverride = Partial<
	Awaited<ReturnType<CommandsRepository['deleteNotification']>>['data']
>;

export function givenNotificationDeleted(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	overrides: SoftDeleteNotificationOverride = {},
) {
	givenResolved(commandsRepository, 'softDeleteNotification', {
		ok: true,
		data: {
			id: DEFAULT_NOTIFICATION_ID,
			deleted: true,
			...overrides,
		},
	});
}

export function givenNotificationDeleteFailure(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	code = 'UNKNOWN_ERROR',
	message = 'Failed to delete notification',
) {
	givenResolved(commandsRepository, 'softDeleteNotification', {
		ok: false,
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
			read: true,
			...overrides,
		},
	});
}

export function givenMarkNotificationAsReadFailure(
	commandsRepository: NotificationsSutMocks['commandsRepository'],
	code = 'UNKNOWN_ERROR',
	message = 'Failed to mark notification as read',
) {
	givenResolved(commandsRepository, 'markNotificationAsRead', {
		ok: false,
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
		type: 'generic',
		read: false,
		createdAt: new Date(),
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
