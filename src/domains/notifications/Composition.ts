import { createNotificationsCommandsRouter } from './adapters/CommandsRouter';
import { createNotificationsQueriesRouter } from './adapters/QueriesRouter';
import { queriesRepository } from './infra/queries-repository/Repository';
import { commandsRepository } from './infra/commands-repository/Repository';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import type { NotificationsQueriesServices } from './ports/Queries';
import type { NotificationsCommandsServices } from './ports/Commands';
import {
	getUserNotificationsFactory,
	getNotificationByIdFactory,
} from './use-cases/queries/Index';
import {
	markNotificationAsReadFactory,
	deleteNotificationFactory,
} from './use-cases/commands/Index';
import { createNotificationFactory } from './use-cases/commands/create-notification/execute';

const notificationsQueriesServices: NotificationsQueriesServices = {
	getUserNotifications: getUserNotificationsFactory({
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	getNotificationById: getNotificationByIdFactory({
		queriesRepository,
		usersContract: usersPublicContract,
	}),
};

export const notificationsCommandsServices: NotificationsCommandsServices = {
	markAsRead: markNotificationAsReadFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
	deleteNotification: deleteNotificationFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
	createNotification: createNotificationFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
};

export const notificationsQueriesRouter = createNotificationsQueriesRouter(
	notificationsQueriesServices,
);

export const notificationsCommandsRouter = createNotificationsCommandsRouter(
	notificationsCommandsServices,
);
