/* eslint-disable max-lines-per-function */
import { mock } from 'bun:test';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type {
	CommandsRepository,
	CreateNotificationParams,
	DeleteNotificationParams,
	MarkNotificationAsReadParams,
} from '../../ports/Commands';

import { createMockedContract, makeParams, makeSut } from '@TestUtils';

import {
	givenUser,
	givenNotificationInserted,
	givenNotificationInsertFailure,
	type UserBasicInfoOverride,
	type InsertNotificationOverride,
	givenNotificationDeleteFailure,
	givenNotificationDeleted,
	type DeleteNotificationOverride,
	givenNotificationMarkedAsRead,
	type MarkNotificationAsReadOverride,
	givenMarkNotificationAsReadFailure,
	givenNotificationNotFound,
	givenNotificationFound,
	type NotificationOverride,
	givenUserNotifications,
} from './Givens';

import {
	createNotificationFactory,
	deleteNotificationFactory,
	markNotificationAsReadFactory,
} from '../commands/Index';

import {
	DEFAULT_USER_ID,
	DEFAULT_NOTIFICATION_TITLE,
	DEFAULT_NOTIFICATION_BODY,
	DEFAULT_NOTIFICATION_ID,
	DEFAULT_PAGE,
} from './Constants';

import type { NotificationsSutMocks } from './SutMocks';
import type {
	GetNotificationByIdParams,
	GetUserNotificationsParams,
	QueriesRepository,
} from '../../ports/Queries';
import {
	getNotificationByIdFactory,
	getUserNotificationsFactory,
} from '../queries/Index';
import type { NotificationPage } from '@Domains/notifications/ports/Models';

const notificationsMockFactories = {
	usersContract: createMockedContract<UsersPublicContract>({
		selectUserBasicInfo: mock(),
		selectAuthUserByEmail: mock(),
	}),
	commandsRepository: createMockedContract<CommandsRepository>({
		insertNotification: mock(),
		markNotificationAsRead: mock(),
		deleteNotification: mock(),
	}),
	queriesRepository: createMockedContract<QueriesRepository>({
		selectUserNotifications: mock(),
		selectNotificationById: mock(),
	}),
};

function notificationsFactory(deps: typeof notificationsMockFactories) {
	return {
		createNotification: createNotificationFactory(deps),
		deleteNotification: deleteNotificationFactory(deps),
		markNotificationAsRead: markNotificationAsReadFactory(deps),
		getUserNotifications: getUserNotificationsFactory(deps),
		getNotificationById: getNotificationByIdFactory(deps),
	};
}

export function makeNotificationsScenario() {
	const { sut, mocks } = makeSut(
		notificationsFactory,
		notificationsMockFactories,
	);

	const api = {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return api;
		},

		withNotificationInserted(overrides: InsertNotificationOverride = {}) {
			givenNotificationInserted(mocks.commandsRepository, overrides);
			return api;
		},

		withNotificationInsertFailure(code?: string, message?: string) {
			givenNotificationInsertFailure(mocks.commandsRepository, code, message);
			return api;
		},
		withNotificationDeleted(overrides: DeleteNotificationOverride = {}) {
			givenNotificationDeleted(mocks.commandsRepository, overrides);
			return api;
		},

		withNotificationDeleteFailure(code?: string, message?: string) {
			givenNotificationDeleteFailure(mocks.commandsRepository, code, message);
			return api;
		},
		withNotificationMarkedAsRead(
			overrides: MarkNotificationAsReadOverride = {},
		) {
			givenNotificationMarkedAsRead(mocks.commandsRepository, overrides);
			return api;
		},

		withMarkNotificationAsReadFailure(code?: string, message?: string) {
			givenMarkNotificationAsReadFailure(
				mocks.commandsRepository,
				code,
				message,
			);
			return api;
		},
		withNotificationFound(overrides: NotificationOverride = {}) {
			givenNotificationFound(mocks.queriesRepository, overrides);
			return api;
		},

		withNotificationNotFound() {
			givenNotificationNotFound(mocks.queriesRepository);
			return api;
		},

		withUserNotifications(page: NotificationPage = DEFAULT_PAGE) {
			givenUserNotifications(mocks.queriesRepository, page);
			return api;
		},

		createNotification(params: Partial<CreateNotificationParams> = {}) {
			return sut.createNotification(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						type: 'POEM_COMMENT_CREATED',
						title: DEFAULT_NOTIFICATION_TITLE,
						body: DEFAULT_NOTIFICATION_BODY,
						actorId: 2,
						entityId: 42,
						entityType: 'POEM',
						data: { commentSnippet: 'Hello World' },
						...params,
					},
					params,
				),
			);
		},

		deleteNotification(params: Partial<DeleteNotificationParams> = {}) {
			return sut.deleteNotification(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						notificationId: DEFAULT_NOTIFICATION_ID,
					},
					params,
				),
			);
		},
		markAsRead(params: Partial<MarkNotificationAsReadParams> = {}) {
			return sut.markNotificationAsRead(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						notificationId: DEFAULT_NOTIFICATION_ID,
					},
					params,
				),
			);
		},
		getNotificationById(params: Partial<GetNotificationByIdParams> = {}) {
			return sut.getNotificationById(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						notificationId: DEFAULT_NOTIFICATION_ID,
					},
					params,
				),
			);
		},

		executeGetUserNotifications(
			params: Partial<GetUserNotificationsParams> = {},
		) {
			return sut.getUserNotifications(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						onlyUnread: false,
						limit: 20,
						nextCursor: undefined,
					},
					params,
				),
			);
		},

		get mocks(): NotificationsSutMocks {
			return mocks;
		},
	};

	return api;
}
