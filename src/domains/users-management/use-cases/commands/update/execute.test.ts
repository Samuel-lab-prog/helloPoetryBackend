import { describe, it, expect, mock } from 'bun:test';
import { updateUserFactory } from './execute';
import type { CommandsRepository } from '../../../ports/commands/Repository';
import { UserUpdateConflictError, UserUpdateError } from '../../Errors';

describe('USE-CASE - Users Management', () => {
	const insertUser = mock();
	const updateUserRepo = mock();
	const softDeleteUser = mock();

	const commandsRepository: CommandsRepository = {
		insertUser,
		updateUser: updateUserRepo,
		softDeleteUser,
	};

	const updateUser: ReturnType<typeof updateUserFactory> = updateUserFactory({
		commandsRepository,
	});

	describe('Update User', () => {
		it('Does not allow nickname conflicts', () => {
			updateUserRepo.mockResolvedValueOnce({
				ok: false,
				code: 'CONFLICT',
				message: 'nickname already in use',
			});
			expect(
				updateUser({
					requesterId: 1,
					requesterStatus: 'active',
					targetId: 1,
					data: {
						nickname: 'existing_nickname',
					},
				}),
			).rejects.toThrow(UserUpdateConflictError);
		});

		it('Should propagate other errors from the repository', () => {
			updateUserRepo.mockResolvedValueOnce({
				ok: false,
				code: 'CONFLICT',
				message: 'some other conflict',
			});
			expect(
				updateUser({
					requesterId: 1,
					requesterStatus: 'active',
					targetId: 1,
					data: {
						nickname: 'new_nickname',
					},
				}),
			).rejects.toThrow(UserUpdateError);
		});

		it('Successfully updates user data', async () => {
			const updatedUser = {
				id: 1,
				nickname: 'new_nickname',
				status: 'active',
			};
			updateUserRepo.mockResolvedValueOnce({
				ok: true,
				data: updatedUser,
			});
			const result = await updateUser({
				requesterId: 1,
				requesterStatus: 'active',
				targetId: 1,
				data: {
					nickname: 'new_nickname',
				},
			});
			expect(result).not.toBeNull();
			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('nickname', 'new_nickname');
		});
	});
});
