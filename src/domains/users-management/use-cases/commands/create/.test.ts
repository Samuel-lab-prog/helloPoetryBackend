import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { createUserFactory } from './execute';
import { UserCreationError } from '../Errors';

import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { HashServices } from '../../../ports/HashSerices';
import type { CreateUser } from '../models/Create';

describe('createUserFactory', () => {
	let userCommandsRepository: CommandsRepository;
	let hashServices: HashServices;

	const fakeUser: CreateUser = {
		name: 'Samuel',
		nickname: 'samuel',
		email: 'samuel@email.com',
		password: 'plain-password',
		bio: 'Average poetry lover',
		avatarUrl: 'http://avatar.url/samuel.png',
	};

	beforeEach(() => {
		userCommandsRepository = {
			insertUser: mock(),
			updateUser: mock(),
			softDeleteUser: mock(),
		};

		hashServices = {
			hash: mock(() => Promise.resolve('hashed-password')),
			compare: mock(),
		};
	});

	it('should hash password before inserting user', async () => {
		userCommandsRepository.insertUser = mock(() => Promise.resolve({ id: 1 }));

		const createUser = createUserFactory({
			userCommandsRepository,
			hashServices,
		});

		const result = await createUser(fakeUser);

		expect(hashServices.hash).toHaveBeenCalledWith('plain-password');

		expect(userCommandsRepository.insertUser).toHaveBeenCalledWith({
			...fakeUser,
			passwordHash: 'hashed-password',
		});

		expect(result).toEqual({ id: 1 });
	});

	it('should never pass plain password to repository', async () => {
		userCommandsRepository.insertUser = mock((data) => {
			expect(data.passwordHash).not.toBe('plain-password');
			return Promise.resolve({ id: 1 });
		});

		const createUser = createUserFactory({
			userCommandsRepository,
			hashServices,
		});

		await createUser(fakeUser);
	});

	it('should throw UserCreationError when repository returns null', async () => {
		userCommandsRepository.insertUser = mock(() => Promise.resolve(null));

		const createUser = createUserFactory({
			userCommandsRepository,
			hashServices,
		});

		await expect(createUser(fakeUser)).rejects.toBeInstanceOf(
			UserCreationError,
		);
	});
});
