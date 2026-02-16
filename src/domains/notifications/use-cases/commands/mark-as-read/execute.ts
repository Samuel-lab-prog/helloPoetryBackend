import type {
	CommandsRepository,
	MarkNotificationAsReadParams,
} from '../../../ports/Commands';

import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export interface MarkNotificationAsReadDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersPublicContract;
}

export function markNotificationAsReadFactory({
	commandsRepository,
	usersContract,
}: MarkNotificationAsReadDependencies) {
	return async function markNotificationAsRead(
		params: MarkNotificationAsReadParams,
	) {
		const { userId, notificationId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const notification = await commandsRepository.markNotificationAsRead(
			userId,
			notificationId,
		);

		if (!notification.ok) {
			if (notification.code === 'NOT_FOUND')
				v.throwNew('NOT_FOUND', 'Notification not found');
			else
				v.throwNew(
					notification.code,
					notification.message || 'Failed to delete notification',
				);
		}
		return notification.data!;
	};
}
