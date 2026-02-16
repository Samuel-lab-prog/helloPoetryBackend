import type { EventName } from '@SharedKernel/events/EventBus';
import type { NotificationModel as DbNotification } from '@PrismaGenerated/models';

export type NotificationModel = {
	id: number;
	userId: number;
	type: EventName;
	title: string;
	body: string;
	data?: unknown;
	createdAt: Date;
	readAt: Date | null;
};

export function toNotificationModel(db: DbNotification): NotificationModel {
	return {
		id: db.id,
		userId: db.userId,
		type: db.type as EventName,
		title: db.title,
		body: db.body,
		data: db.data ?? undefined,
		createdAt: db.createdAt,
		readAt: db.readAt,
	};
}

export function toNotificationModels(
	rows: DbNotification[],
): NotificationModel[] {
	return rows.map(toNotificationModel);
}
