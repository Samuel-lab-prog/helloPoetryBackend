import type {
	CommandsRepository,
	UpdateUserParams,
} from '../../../ports/Commands';
import type { FullUser } from '../../Models';
import { UserUpdateError, UserUpdateConflictError } from '../../Errors';
import { canUpdateData } from '../../Policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function updateUserFactory({ commandsRepository }: Dependencies) {
	return async function updateUser(
		params: UpdateUserParams,
	): Promise<FullUser> {
		const { targetId, data, requesterId, requesterStatus } = params;
		canUpdateData({
			requesterId,
			requesterStatus,
			targetId,
		});

		const result = await commandsRepository.updateUser(targetId, data);

		if (result.ok) return result.data;
		if (result.code !== 'CONFLICT')
			throw new UserUpdateError('Failed to update user');
		if (result.message?.includes('nickname'))
			throw new UserUpdateConflictError('Nickname already in use');
		if (result.message?.includes('email'))
			throw new UserUpdateConflictError('Email already in use');
		throw new UserUpdateError('Failed to update user due to unknown conflict');
	};
}
