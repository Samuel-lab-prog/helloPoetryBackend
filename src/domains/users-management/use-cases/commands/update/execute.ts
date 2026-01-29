import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { UpdateUserData } from '../models/Update';
import { UserUpdateError, CrossUserUpdateError } from '../Errors';
import { canUpdateData } from '../policies/policies';

interface Dependencies {
	userCommandsRepository: CommandsRepository;
}

export function updateUserFactory({ userCommandsRepository }: Dependencies) {
	return async function updateUser(
		requesterId: number,
		targetId: number,
		data: UpdateUserData,
	): Promise<{ id: number }> {
		if (!canUpdateData({ requesterId, targetId })) {
			throw new CrossUserUpdateError();
		}

		const result = await userCommandsRepository.updateUser(targetId, data);
		if (!result) {
			throw new UserUpdateError();
		}

		return result;
	};
}
