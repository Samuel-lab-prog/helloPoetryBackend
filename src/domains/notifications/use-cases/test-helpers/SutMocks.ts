import {
	type MockedContract,
	createMockedContract,
} from '@GenericSubdomains/utils/testUtils';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import { mock } from 'bun:test';

export type NotificationsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersPublicContract>;
};

import {
	createNotificationFactory,
	deleteNotificationFactory,
	markNotificationAsReadFactory,
} from '../commands/Index';

import {
	getNotificationByIdFactory,
	getUserNotificationsFactory,
} from '../queries/Index';
import { markAllNotificationsAsReadFactory } from '../commands/mark-all/execute';

export function notificationsMockFactory() {
	return {
		usersContract: createMockedContract<UsersPublicContract>({
			selectUserBasicInfo: mock(),
			selectAuthUserByEmail: mock(),
		}),
		commandsRepository: createMockedContract<CommandsRepository>({
			insertNotification: mock(),
			markNotificationAsRead: mock(),
			deleteNotification: mock(),
			markAllAsRead: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			selectUserNotifications: mock(),
			selectNotificationById: mock(),
		}),
	};
}

type Deps = ReturnType<typeof notificationsMockFactory>;

export function notificationsFactory(deps: Deps) {
	return {
		createNotification: createNotificationFactory(deps),
		deleteNotification: deleteNotificationFactory(deps),
		markNotificationAsRead: markNotificationAsReadFactory(deps),
		getUserNotifications: getUserNotificationsFactory(deps),
		getNotificationById: getNotificationByIdFactory(deps),
		markAllAsRead: markAllNotificationsAsReadFactory(deps),
	};
}
