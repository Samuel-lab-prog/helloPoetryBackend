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
import { toNotificationModel } from '../Mappers';

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
	return await withPrismaResult(async () => {
		const notification = await prisma.notification.create({
			data: toPrismaCreateInput(params),
		});
		return toNotificationModel(notification);
	});
}

async function markNotificationAsRead(
	notificationId: number,
): Promise<CommandResult<NotificationUpdateResult>> {
	return await withPrismaResult(async () => {
		const notification = await prisma.notification.update({
			where: { id: notificationId },
			data: { readAt: new Date() },
		});
		return toNotificationModel(notification);
	});
}

async function softDeleteNotification(
	notificationId: number,
): Promise<CommandResult<NotificationDeleteResult>> {
	return await withPrismaResult(async () => {
		const notification = await prisma.notification.update({
			where: { id: notificationId },
			data: { deletedAt: new Date() },
		});
		return toNotificationModel(notification);
	});
}

export const commandsRepository: CommandsRepository = {
	insertNotification,
	markNotificationAsRead,
	softDeleteNotification,
};
