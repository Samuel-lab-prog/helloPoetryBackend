import type { UserCommandsRepository } from '../../../ports/CommandsRepository';
import type { UpdateUserData } from '../commands-models/Update';
import { UserUpdateError, CrossUserUpdateError } from '../errors';
import { canUpdateData } from '../policies/policies';

interface Dependencies {
	userCommandsRepository: UserCommandsRepository;
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
