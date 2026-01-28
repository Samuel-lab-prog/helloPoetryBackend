import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { updateUserFactory } from './execute';
import { UserUpdateError, CrossUserUpdateError } from '../errors';

import * as policies from '../policies/policies';

import type { UserCommandsRepository } from '../../../ports/CommandsRepository';
import type { UpdateUserData } from '../commands-models/Update';

mock.module('../policies/policies', () => ({
	canUpdateData: mock(() => true),
}));

describe('updateUserFactory', () => {
	let userCommandsRepository: UserCommandsRepository;

	beforeEach(() => {
		userCommandsRepository = {
			insertUser: mock(),
			updateUser: mock(),
			softDeleteUser: mock(),
		};

		(policies.canUpdateData as any).mockReset();
	});

	it('should update user when policy allows', async () => {
		(policies.canUpdateData as any).mockReturnValue(true);

		userCommandsRepository.updateUser = mock(() => Promise.resolve({ id: 2 }));

		const updateUser = updateUserFactory({ userCommandsRepository });

		const data: UpdateUserData = {
			name: 'Updated name',
			bio: 'Updated bio',
		};

		const result = await updateUser(1, 2, data);

		expect(policies.canUpdateData).toHaveBeenCalledWith({
			requesterId: 1,
			targetId: 2,
		});

		expect(userCommandsRepository.updateUser).toHaveBeenCalledWith(2, data);
		expect(result).toEqual({ id: 2 });
	});

	it('should throw CrossUserUpdateError when policy denies access', async () => {
		(policies.canUpdateData as any).mockReturnValue(false);

		const updateUser = updateUserFactory({ userCommandsRepository });

		await expect(updateUser(1, 2, { name: 'hack' })).rejects.toBeInstanceOf(
			CrossUserUpdateError,
		);

		expect(policies.canUpdateData).toHaveBeenCalledWith({
			requesterId: 1,
			targetId: 2,
		});

		expect(userCommandsRepository.updateUser).not.toHaveBeenCalled();
	});

	it('should throw UserUpdateError when repository returns null', async () => {
		(policies.canUpdateData as any).mockReturnValue(true);

		userCommandsRepository.updateUser = mock(() => Promise.resolve(null));

		const updateUser = updateUserFactory({ userCommandsRepository });

		await expect(updateUser(1, 2, { bio: 'fail' })).rejects.toBeInstanceOf(
			UserUpdateError,
		);

		expect(userCommandsRepository.updateUser).toHaveBeenCalledWith(2, {
			bio: 'fail',
		});
	});
});
