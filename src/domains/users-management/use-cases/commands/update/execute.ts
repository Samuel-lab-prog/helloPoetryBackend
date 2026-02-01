import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { FullUser } from '../../queries/models/FullUser';
import type { UpdateUserData } from '../models/Update';
import {
	UserUpdateError,
	UserUpdateConflictError,
	CrossUserUpdateError,
	UserNotFoundError,
} from '../Errors';
import { canUpdateData } from '../policies/policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function updateUserFactory({ commandsRepository }: Dependencies) {
	return async function updateUser(
		requesterId: number,
		targetId: number,
		data: UpdateUserData,
	): Promise<FullUser> {
		if (!canUpdateData({ requesterId, targetId })) {
			throw new CrossUserUpdateError();
		}

		const result = await commandsRepository.updateUser(targetId, data);

		if (!result.ok) {
			if (result.failureReason === 'NOT_FOUND') {
				throw new UserNotFoundError();
			}

			if (result.failureReason === 'DUPLICATE_EMAIL') {
				throw new UserUpdateConflictError('Email already exists');
			}

			if (result.failureReason === 'DUPLICATE_NICKNAME') {
				throw new UserUpdateConflictError('Nickname already exists');
			}
			throw new UserUpdateError('Failed to update user');
		}

		return result.data;
	};
}
