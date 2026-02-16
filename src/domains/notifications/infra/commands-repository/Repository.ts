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
    data: params.data ? JSON.stringify(params.data) : undefined,
    actorId: params.actorId ?? undefined,
    entityId: params.entityId ?? undefined,
    entityType: params.entityType ?? undefined,
    aggregatedCount: params.aggregatedCount ?? 1,
  };
}

async function insertNotification(
  params: CreateNotificationParams,
): Promise<CommandResult<NotificationCreateResult>> {
  return await withPrismaResult(async () => {
    // Tenta buscar notificação existente para agregação (Opção A)
    if (params.aggregateWindowMinutes && params.entityId && params.entityType) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: params.userId,
          type: params.type,
          entityId: params.entityId,
          entityType: params.entityType,
          createdAt: {
            gte: new Date(Date.now() - params.aggregateWindowMinutes * 60 * 1000),
          },
        },
      });

      if (existing) {
        const updated = await prisma.notification.update({
          where: { id: existing.id },
          data: { aggregatedCount: existing.aggregatedCount + 1, updatedAt: new Date() },
        });
        return updated
      }
    }

    const notification = await prisma.notification.create({
      data: toPrismaCreateInput(params),
    });
    return notification;
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
    return notification;
  });
}

async function deleteNotification(
  notificationId: number,
): Promise<CommandResult<NotificationDeleteResult>> {
  return await withPrismaResult(async () => {
    const notification = await prisma.notification.delete({
      where: { id: notificationId },
    });
    return notification;
  });
}

export const commandsRepository: CommandsRepository = {
  insertNotification,
  markNotificationAsRead,
  deleteNotification,
};
