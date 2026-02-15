import { prisma } from '@PrismaClient';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type {
	CommandsRepository,
	CreateNotificationParams,
} from '../../ports/Commands';
import type {
	NotificationCreateResult,
	NotificationUpdateResult,
	NotificationDeleteResult,
} from '@Domains/notifications/ports/Models';
import type { NotificationCreateInput } from '@PrismaGenerated/models';

function toPrismaCreateInput(
	params: CreateNotificationParams,
): NotificationCreateInput {
	return {
		user: { connect: { id: params.userId } },
		type: params.type,
		title: params.title,
		body: params.body,
		data: params.data ? JSON.stringify(params.data) : undefined,
	};
}

async function insertNotification(
	params: CreateNotificationParams,
): Promise<CommandResult<NotificationCreateResult>> {
	return await withPrismaResult(() => {
		return prisma.notification.create({
			data: toPrismaCreateInput(params),
		});
	});
}

async function markNotificationAsRead(
	notificationId: number,
): Promise<CommandResult<NotificationUpdateResult>> {
	return await withPrismaResult(() => {
		return prisma.notification.update({
			where: { id: notificationId },
			data: { readAt: new Date() },
		});
	});
}

async function softDeleteNotification(
	notificationId: number,
): Promise<CommandResult<NotificationDeleteResult>> {
	return await withPrismaResult(() => {
		return prisma.notification.update({
			where: { id: notificationId },
			data: { deletedAt: new Date() },
		});
	});
}

export const commandsRepository: CommandsRepository = {
	insertNotification,
	markNotificationAsRead,
	softDeleteNotification,
};
