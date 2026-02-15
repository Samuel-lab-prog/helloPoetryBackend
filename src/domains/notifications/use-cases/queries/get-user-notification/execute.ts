import type {
	QueriesRepository,
	GetNotificationByIdParams,
} from '../../../ports/Queries';

import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export interface GetNotificationByIdDependencies {
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function getNotificationByIdFactory({
	queriesRepository,
	usersContract,
}: GetNotificationByIdDependencies) {
	return async function getNotificationById(params: GetNotificationByIdParams) {
		const { userId, notificationId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const notification = await queriesRepository.findNotificationById(
			userId,
			notificationId,
		);

		v.ensure(notification)
			.notNull('Notification not found')
			.notUndefined('Notification not found');

		return notification;
	};
}
