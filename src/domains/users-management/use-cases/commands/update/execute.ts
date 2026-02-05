import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { FullUser } from '../../queries/models/FullUser';
import type { UpdateUserData } from '../models/Update';
import {
	UserUpdateError,
	UserUpdateConflictError,
	CrossUserUpdateError,
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

		if (result.ok) return result.data;
		
				if(result.code !== 'CONFLICT') {
					throw new UserUpdateError('Failed to update user');
				}
				if (result.message?.includes('nickname')) {
					throw new UserUpdateConflictError('Nickname already in use');
				}
				if (result.message?.includes('email')) {
					throw new UserUpdateConflictError('Email already in use');
				}
				throw new UserUpdateError('Failed to update user due to unknown conflict');
			};
	};
