import type {
	QueriesRepository,
	GetUserNotificationsParams,
} from '../../../ports/Queries';

import { validator } from '@SharedKernel/validators/Global';
import { type UsersPublicContract } from '@Domains/users-management/public/Index';
import type { NotificationPage } from '@Domains/notifications/ports/Models';

export interface GetUserNotificationsDependencies {
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function getUserNotificationsFactory({
	queriesRepository,
	usersContract,
}: GetUserNotificationsDependencies) {
	return async function getUserNotifications(
		params: GetUserNotificationsParams,
	): Promise<NotificationPage> {
		const { userId, onlyUnread = false, limit = 20, offset = 0 } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const notifications = await queriesRepository.selectUserNotifications(
			userId,
			{
				onlyUnread,
				limit,
				offset,
			},
		);

		return notifications;
	};
}
