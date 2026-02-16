import type {
	CommandsRepository,
	DeleteNotificationParams,
} from '../../../ports/Commands';

import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { NotFoundError } from '@DomainError';

export interface DeleteNotificationDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersPublicContract;
}

export function deleteNotificationFactory({
	commandsRepository,
	usersContract,
}: DeleteNotificationDependencies) {
	return async function deleteNotification(params: DeleteNotificationParams) {
		const { userId, notificationId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const notification = await commandsRepository.softDeleteNotification(
			userId,
			notificationId,
		);

		if (!notification.ok) {
			if (notification.code === 'NOT_FOUND')
				throw new NotFoundError('Notification not found');
			else
				v.throwNew(
					notification.code,
					notification.message || 'Failed to delete notification',
				);
		}
		return notification.data!;
	};
}
