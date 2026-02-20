import { describe, it, expect, mock } from 'bun:test';
import { createUserFactory } from './execute';
import type { CommandsRepository } from '../../../ports/Commands';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { ConflictError, UnknownError } from '@DomainError';

describe('USE-CASE - Users Management', () => {
	const insertUser = mock();

	const commandsRepository: CommandsRepository = {
		insertUser,
		updateUser: mock(),
		softDeleteUser: mock(),
	};

	const hash = mock();
	const compare = mock();

	const hashServices: HashServices = {
		hash,
		compare,
	};

	const validUserData = {
		name: 'user1',
		nickname: 'user1',
		email: 'user1@gmail.com',
		password: 'password123',
		avatarUrl: 'http://example.com/avatar.png',
		bio: 'Hello, I am user1',
	};

	const createUser: ReturnType<typeof createUserFactory> = createUserFactory({
		commandsRepository,
		hashServices,
	});

	describe('Create User', () => {
		it('Hashes the password before persisting', async () => {
			hash.mockResolvedValueOnce('hashed_password');
			insertUser.mockResolvedValueOnce({
				ok: true,
				data: validUserData,
			});

			await createUser({
				data: validUserData,
			});

			expect(hash).toHaveBeenCalledWith('password123');
			expect(insertUser).toHaveBeenCalledWith({
				...validUserData,
				passwordHash: 'hashed_password',
			});
		});

		it('Does not allow nickname conflicts', () => {
			hash.mockResolvedValueOnce('hashed_password');
			insertUser.mockResolvedValueOnce({
				ok: false,
				code: 'CONFLICT',
				message: 'nickname already in use',
			});

			expect(createUser({ data: validUserData })).rejects.toThrow(
				ConflictError,
			);
		});

		it('Does not allow email conflicts', () => {
			hash.mockResolvedValueOnce('hashed_password');
			insertUser.mockResolvedValueOnce({
				ok: false,
				code: 'CONFLICT',
				message: 'email already in use',
			});

			expect(createUser({ data: validUserData })).rejects.toThrow(
				ConflictError,
			);
		});

		it('Propagates non-conflict repository errors', () => {
			hash.mockResolvedValueOnce('hashed_password');
			insertUser.mockResolvedValueOnce({
				ok: false,
				code: 'UNKNOWN',
				message: 'database is down',
			});

			expect(createUser({ data: validUserData })).rejects.toThrow(
				UnknownError,
			);
		});

		it('Throws generic error for unknown conflicts', () => {
			hash.mockResolvedValueOnce('hashed_password');
			insertUser.mockResolvedValueOnce({
				ok: false,
				code: 'CONFLICT',
				message: 'some other unique constraint',
			});

			expect(createUser({ data: validUserData })).rejects.toThrow(
				UnknownError,
			);
		});

		it('Successfully creates a user', async () => {
			const createdUser = {
				id: 1,
				nickname: 'john',
				email: 'john@email.com',
				status: 'active',
			};

			hash.mockResolvedValueOnce('hashed_password');
			insertUser.mockResolvedValueOnce({
				ok: true,
				data: createdUser,
			});

			const result = await createUser({
				data: validUserData,
			});

			expect(result).not.toBeNull();
			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('nickname', 'john');
			expect(result).toHaveProperty('email', 'john@email.com');
		});
	});
});
