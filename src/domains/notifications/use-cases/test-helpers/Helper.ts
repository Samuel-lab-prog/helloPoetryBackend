/* eslint-disable max-lines-per-function */

import type {
	CreateNotificationParams,
	DeleteNotificationParams,
	MarkNotificationAsReadParams,
} from '../../ports/Commands';

import { makeParams, makeSut } from '@TestUtils';

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
	givenAllNotificationsMarkedAsRead,
} from './Givens';

import {
	DEFAULT_USER_ID,
	DEFAULT_NOTIFICATION_ID,
	DEFAULT_PAGE,
} from './Constants';

import {
	type NotificationsSutMocks,
	notificationsFactory,
	notificationsMockFactory,
} from './SutMocks';
import type {
	GetNotificationByIdParams,
	GetUserNotificationsParams,
} from '../../ports/Queries';

import type { NotificationPage } from '@Domains/notifications/ports/Models';
import type { AppErrorCode } from '@AppError';

export function makeNotificationsScenario() {
	const { sut, mocks } = makeSut(
		notificationsFactory,
		notificationsMockFactory(),
	);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},

		withNotificationInserted(overrides: InsertNotificationOverride = {}) {
			givenNotificationInserted(mocks.commandsRepository, overrides);
			return this;
		},

		withNotificationInsertFailure(code?: AppErrorCode, message?: string) {
			givenNotificationInsertFailure(mocks.commandsRepository, code, message);
			return this;
		},

		withNotificationDeleted(overrides: DeleteNotificationOverride = {}) {
			givenNotificationDeleted(mocks.commandsRepository, overrides);
			return this;
		},

		withNotificationDeleteFailure(code?: AppErrorCode, message?: string) {
			givenNotificationDeleteFailure(mocks.commandsRepository, code, message);
			return this;
		},
		withNotificationMarkedAsRead(
			overrides: MarkNotificationAsReadOverride = {},
		) {
			givenNotificationMarkedAsRead(mocks.commandsRepository, overrides);
			return this;
		},

		withAllNotificationsMarkedAsRead() {
			givenAllNotificationsMarkedAsRead(mocks.commandsRepository);
			return this;
		},

		withMarkNotificationAsReadFailure(code?: AppErrorCode, message?: string) {
			givenMarkNotificationAsReadFailure(
				mocks.commandsRepository,
				code,
				message,
			);
			return this;
		},

		withNotificationFound(overrides: NotificationOverride = {}) {
			givenNotificationFound(mocks.queriesRepository, overrides);
			return this;
		},

		withNotificationNotFound() {
			givenNotificationNotFound(mocks.queriesRepository);
			return this;
		},

		withUserNotifications(page: NotificationPage = DEFAULT_PAGE) {
			givenUserNotifications(mocks.queriesRepository, page);
			return this;
		},

		createNotification(params: Partial<CreateNotificationParams> = {}) {
			return sut.createNotification(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						type: 'POEM_COMMENT_CREATED',
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

		markAllAsRead(params: Partial<{ userId: number }> = {}) {
			return sut.markAllAsRead(makeParams({ userId: DEFAULT_USER_ID }, params));
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
}
