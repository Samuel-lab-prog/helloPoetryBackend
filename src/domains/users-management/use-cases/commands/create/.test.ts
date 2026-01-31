import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { createUserFactory } from './execute';
import { UserCreationError, UserCreationConflictError } from '../Errors';

import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { HashServices } from '../../../ports/HashSerices';
import type { CreateUser } from '../models/Create';

describe('createUserFactory', () => {
	let commandsRepository: CommandsRepository;
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
		commandsRepository = {
			insertUser: mock(),
			updateUser: mock(),
			softDeleteUser: mock(),
		};

		hashServices = {
			hash: mock(() => Promise.resolve('hashed-password')),
			compare: mock(),
		};
	});

	const makeSut = () => createUserFactory({ commandsRepository, hashServices });

	// ------------------------
	// SUCCESS
	// ------------------------

	it('should hash password and create user successfully', async () => {
		commandsRepository.insertUser = mock(() =>
			Promise.resolve({ ok: true as const, id: 1 }),
		);

		const createUser = makeSut();

		const result = await createUser(fakeUser);

		expect(hashServices.hash).toHaveBeenCalledTimes(1);
		expect(hashServices.hash).toHaveBeenCalledWith('plain-password');

		expect(commandsRepository.insertUser).toHaveBeenCalledTimes(1);
		expect(commandsRepository.insertUser).toHaveBeenCalledWith({
			...fakeUser,
			passwordHash: 'hashed-password',
		});

		expect(result).toEqual({ id: 1 });
	});

	it('should never use plain password as passwordHash', async () => {
		commandsRepository.insertUser = mock((data) => {
			expect(data.passwordHash).toBe('hashed-password');
			expect(data.passwordHash).not.toBe('plain-password');
			return Promise.resolve({ ok: true as const, id: 1 });
		});

		const createUser = makeSut();

		await createUser(fakeUser);
	});

	// ------------------------
	// DOMAIN ERRORS
	// ------------------------

	it('should throw UserCreationConflictError when email already exists', async () => {
		commandsRepository.insertUser = mock(() =>
			Promise.resolve({
				ok: false as const,
				failureReason: 'DUPLICATE_EMAIL' as const,
			}),
		);

		const createUser = makeSut();

		await expect(createUser(fakeUser)).rejects.toBeInstanceOf(
			UserCreationConflictError,
		);
	});

	it('should throw UserCreationConflictError when nickname already exists', async () => {
		commandsRepository.insertUser = mock(() =>
			Promise.resolve({
				ok: false as const,
				failureReason: 'DUPLICATE_NICKNAME' as const,
			}),
		);

		const createUser = makeSut();

		await expect(createUser(fakeUser)).rejects.toBeInstanceOf(
			UserCreationConflictError,
		);
	});

	it('should throw UserCreationError on unknown failure', async () => {
		commandsRepository.insertUser = mock(() =>
			Promise.resolve({
				ok: false as const,
				failureReason: undefined,
			}),
		);

		const createUser = makeSut();

		await expect(createUser(fakeUser)).rejects.toBeInstanceOf(
			UserCreationError,
		);
	});

	// ------------------------
	// TECHNICAL ERRORS
	// ------------------------

	it('should propagate hash service errors', async () => {
		hashServices.hash = mock(() => Promise.reject(new Error('hash failed')));

		const createUser = makeSut();

		await expect(createUser(fakeUser)).rejects.toThrow('hash failed');
	});

	it('should propagate repository errors', async () => {
		commandsRepository.insertUser = mock(() =>
			Promise.reject(new Error('db down')),
		);

		const createUser = makeSut();

		await expect(createUser(fakeUser)).rejects.toThrow('db down');
	});
});
