import { createNotificationsCommandsRouter } from './adapters/CommandsRouter';
import { createNotificationsQueriesRouter } from './adapters/QueriesRouter';
import { queriesRepository } from './infra/queries-repository/Repository';
import { commandsRepository } from './infra/commands-repository/Repository';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import type { NotificationsQueriesServices } from './ports/Queries';
import type { NotificationsCommandsServices } from './ports/Commands';
import { eventBus } from '@SharedKernel/events/EventBus';
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

const notificationsCommandsServices: NotificationsCommandsServices = {
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

eventBus.subscribe('poem.comment.created', async (payload) => {
	try {
		await notificationsCommandsServices.createNotification({
			userId: payload.authorId,
			title: 'New comment on your poem',
			body: `Your poem received a comment from ${payload.commenterId}`,
			data: {
				commentId: payload.commentId,
				poemId: payload.poemId,
			},
			type: 'poem.comment.created',
		});
	} catch (err) {
		console.error('Error creating notification via eventBus:', err);
	}
});
