import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type {
	CommandsRepository,
	CreateNotificationParams,
} from '../../ports/Commands';
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
	let currentAggregatedCount = overrides?.aggregatedCount ?? 1;
	const entityId = overrides?.entityId ?? 42;
	const entityType = overrides?.entityType ?? 'POEM';
	const type = overrides?.type ?? 'POEM_COMMENT_CREATED';

	commandsRepository.insertNotification.mockImplementation(
		// eslint-disable-next-line require-await
		async (params: CreateNotificationParams) => {
			if (
				params.aggregateWindowMinutes &&
				params.entityId === entityId &&
				params.entityType === entityType &&
				params.type === type
			) {
				currentAggregatedCount += 1;
			} else {
				currentAggregatedCount = overrides?.aggregatedCount ?? 1;
			}

			return {
				ok: true,
				data: {
					id: overrides?.id ?? 1,
					userId: overrides?.userId ?? DEFAULT_USER_ID,
					type,
					actorId: params.actorId ?? overrides?.actorId ?? 2,
					entityId: params.entityId ?? entityId,
					entityType: params.entityType ?? entityType,
					aggregatedCount: currentAggregatedCount,
					data: params.data ??
						overrides?.data ?? { commentSnippet: 'Hello World' },
					createdAt: overrides?.createdAt ?? new Date(),
					updatedAt: overrides?.updatedAt ?? new Date(),
					readAt: overrides?.readAt ?? null,
				},
			};
		},
	);
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
	givenResolved(commandsRepository, 'deleteNotification', {
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
