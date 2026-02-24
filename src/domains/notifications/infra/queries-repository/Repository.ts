import { prisma } from '@Prisma/prismaClient';
import { withPrismaErrorHandling } from '@Prisma/prismaErrorHandler';
import type { QueriesRepository } from '../../ports/Queries';
import type { NotificationPage } from '../../ports/Models';

export function selectUserNotifications(
	userId: number,
	params: { onlyUnread: boolean; limit: number; nextCursor?: number },
): Promise<NotificationPage> {
	const { onlyUnread, limit, nextCursor } = params;

	return withPrismaErrorHandling(async () => {
		const where = {
			userId,
			...(onlyUnread && { readAt: null }),
		};

		const notifications = await prisma.notification.findMany({
			where,
			orderBy: {
				createdAt: 'desc',
			},
			take: limit + 1,
			...(nextCursor && {
				cursor: { id: nextCursor },
				skip: 1,
			}),
		});

		const hasMore = notifications.length > limit;
		const items = hasMore ? notifications.slice(0, limit) : notifications;
		const nextCursorId = hasMore ? items[items.length - 1]?.id : undefined;

		return {
			notifications: items,
			hasMore,
			nextCursor: nextCursorId,
		};
	});
}

function selectNotificationById(notificationId: number, userId: number) {
	return withPrismaErrorHandling(async () => {
		const notification = await prisma.notification.findFirst({
			where: {
				id: notificationId,
				userId,
			},
		});
		return notification;
	});
}

export const queriesRepository: QueriesRepository = {
	selectUserNotifications,
	selectNotificationById,
};
