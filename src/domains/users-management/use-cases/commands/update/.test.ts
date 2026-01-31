import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { updateUserFactory } from './execute';
import {
	UserUpdateError,
	CrossUserUpdateError,
	UserNotFoundError,
} from '../Errors';

import * as policies from '../policies/policies';

import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { UpdateUserData } from '../models/Update';

mock.module('../policies/policies', () => ({
	canUpdateData: mock(() => true),
}));

describe('updateUserFactory', () => {
	let commandsRepository: CommandsRepository;

	beforeEach(() => {
		commandsRepository = {
			insertUser: mock(),
			updateUser: mock(),
			softDeleteUser: mock(),
		};

		(policies.canUpdateData as any).mockReset();
	});

	const makeSut = () => updateUserFactory({ commandsRepository });

	// ------------------------
	// SUCCESS
	// ------------------------

	it('should update user when policy allows', async () => {
		(policies.canUpdateData as any).mockReturnValue(true);

		commandsRepository.updateUser = mock(() =>
			Promise.resolve({ ok: true as const, id: 2 }),
		);

		const updateUser = makeSut();

		const data: UpdateUserData = {
			name: 'Updated name',
			bio: 'Updated bio',
		};

		const result = await updateUser(1, 2, data);

		expect(policies.canUpdateData).toHaveBeenCalledWith({
			requesterId: 1,
			targetId: 2,
		});

		expect(commandsRepository.updateUser).toHaveBeenCalledTimes(1);
		expect(commandsRepository.updateUser).toHaveBeenCalledWith(2, data);

		expect(result).toEqual({ id: 2 });
	});

	// ------------------------
	// POLICY
	// ------------------------

	it('should throw CrossUserUpdateError when policy denies access', async () => {
		(policies.canUpdateData as any).mockReturnValue(false);

		const updateUser = makeSut();

		await expect(updateUser(1, 2, { name: 'hack' })).rejects.toBeInstanceOf(
			CrossUserUpdateError,
		);

		expect(policies.canUpdateData).toHaveBeenCalledWith({
			requesterId: 1,
			targetId: 2,
		});

		expect(commandsRepository.updateUser).not.toHaveBeenCalled();
	});

	// ------------------------
	// DOMAIN ERRORS
	// ------------------------

	it('should throw UserUpdateError when user does not exist', () => {
		(policies.canUpdateData as any).mockReturnValue(true);

		commandsRepository.updateUser = mock(() =>
			Promise.resolve({
				ok: false as const,
				failureReason: 'NOT_FOUND' as const,
			}),
		);

		const updateUser = makeSut();

		expect(updateUser(1, 2, { bio: 'fail' })).rejects.toBeInstanceOf(
			UserNotFoundError,
		);

		expect(commandsRepository.updateUser).toHaveBeenCalledWith(2, {
			bio: 'fail',
		});
	});

	it('should throw UserUpdateError on unknown failure', async () => {
		(policies.canUpdateData as any).mockReturnValue(true);

		commandsRepository.updateUser = mock(() =>
			Promise.resolve({
				ok: false as const,
				failureReason: 'DB_ERROR' as const,
			}),
		);

		const updateUser = makeSut();

		await expect(updateUser(1, 2, { bio: 'fail' })).rejects.toBeInstanceOf(
			UserUpdateError,
		);
	});

	// ------------------------
	// TECHNICAL ERRORS
	// ------------------------

	it('should propagate repository errors', async () => {
		(policies.canUpdateData as any).mockReturnValue(true);

		commandsRepository.updateUser = mock(() =>
			Promise.reject(new Error('db down')),
		);

		const updateUser = makeSut();

		await expect(updateUser(1, 2, { name: 'x' })).rejects.toThrow('db down');
	});
});
