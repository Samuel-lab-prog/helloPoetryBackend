import { ConflictError } from '@DomainError';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { AdminBootstrapRepository } from '../../../ports/commands';
import type { FullUser } from '../../../ports/models';
import { bootstrapAdminFactory } from './execute';

const findExistingAdmin = mock<AdminBootstrapRepository['findExistingAdmin']>(
	() => Promise.resolve(false),
);
const findUserByEmail = mock<AdminBootstrapRepository['findUserByEmail']>(() =>
	Promise.resolve(null),
);
const findUserByNickname = mock<AdminBootstrapRepository['findUserByNickname']>(
	() => Promise.resolve(null),
);
const updateUserAsAdmin = mock<AdminBootstrapRepository['updateUserAsAdmin']>(
	() => Promise.resolve({ id: 1 } as FullUser),
);
const createAdmin = mock<AdminBootstrapRepository['createAdmin']>(() =>
	Promise.resolve({ id: 2 } as FullUser),
);

const adminBootstrapRepository: AdminBootstrapRepository = {
	findExistingAdmin,
	findUserByEmail,
	findUserByNickname,
	updateUserAsAdmin,
	createAdmin,
};

const hashServices = {
	hash: mock(() => Promise.resolve('hashed_password')),
	compare: mock(() => Promise.resolve(true)),
};

const DEFAULT_PARAMS = {
	email: 'admin@olapoesia.dev',
	password: 'plain_password',
	name: 'Admin',
	nickname: 'admin',
	bio: 'Admin bio',
	avatarUrl: null,
};

const execute = () =>
	bootstrapAdminFactory({ hashServices, adminBootstrapRepository });

describe('USE-CASE - Users Management - BootstrapAdmin', () => {
	beforeEach(() => {
		findExistingAdmin.mockReset();
		findUserByEmail.mockReset();
		findUserByNickname.mockReset();
		updateUserAsAdmin.mockReset();
		createAdmin.mockReset();
		hashServices.hash.mockReset();
		hashServices.hash.mockResolvedValue('hashed_password');
		findExistingAdmin.mockResolvedValue(false);
		findUserByEmail.mockResolvedValue(null);
		findUserByNickname.mockResolvedValue(null);
		updateUserAsAdmin.mockResolvedValue({ id: 1 } as FullUser);
		createAdmin.mockResolvedValue({ id: 2 } as FullUser);
	});

	it('throws ConflictError when admin bootstrap already completed', async () => {
		findExistingAdmin.mockResolvedValue(true);

		await expect(execute()(DEFAULT_PARAMS)).rejects.toBeInstanceOf(
			ConflictError,
		);
		expect(findUserByEmail).not.toHaveBeenCalled();
	});

	it('updates an existing user by email and returns created=false', async () => {
		findUserByEmail.mockResolvedValue({ id: 10, nickname: 'admin' });

		const result = await execute()(DEFAULT_PARAMS);

		expect(result.created).toBe(false);
		expect(updateUserAsAdmin).toHaveBeenCalledWith(10, {
			passwordHash: 'hashed_password',
			name: 'Admin',
			nickname: 'admin',
			bio: 'Admin bio',
			avatarUrl: null,
		});
	});

	it('throws ConflictError when the requested nickname is already in use', async () => {
		findUserByEmail.mockResolvedValue({ id: 10, nickname: 'someone-else' });
		findUserByNickname.mockResolvedValue({ id: 20 });

		await expect(execute()(DEFAULT_PARAMS)).rejects.toBeInstanceOf(
			ConflictError,
		);
		expect(updateUserAsAdmin).not.toHaveBeenCalled();
	});

	it('creates an admin when email and nickname are free', async () => {
		const result = await execute()(DEFAULT_PARAMS);

		expect(result.created).toBe(true);
		expect(createAdmin).toHaveBeenCalledWith({
			email: 'admin@olapoesia.dev',
			passwordHash: 'hashed_password',
			name: 'Admin',
			nickname: 'admin',
			bio: 'Admin bio',
			avatarUrl: null,
		});
	});
});
