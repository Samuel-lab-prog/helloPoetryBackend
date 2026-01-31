import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { getUserFactory } from './execute';
import { UserNotFoundError, CrossUserDataAccessError } from '../Errors';
import * as policies from '../policies/policies';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FullUser, UserRole } from '../models/Index';

mock.module('../policies/policies', () => ({
	canAccessUserInfo: mock(() => true),
}));

describe('getUserFactory', () => {
	let queriesRepository: QueriesRepository;

	const fakeUser: FullUser = {
		id: 1,
		email: 'samuel@email.com',
		name: 'Samuel',
		nickname: 'samuel',
		role: 'user',
		status: 'active',
		bio: 'Average poetry lover',
		avatarUrl: 'http://avatar.url/samuel.png',
		createdAt: new Date(),
		updatedAt: new Date(),
		emailVerifiedAt: null,
		friendsIds: [2, 3],
	};

	beforeEach(() => {
		queriesRepository = {
			selectPrivateProfile: mock(),
			selectPublicProfile: mock(),
			selectAuthUserByEmail: mock(),
			selectUserByEmail: mock(),
			selectUserById: mock(),
			selectUserByNickname: mock(),
			selectUsers: mock(),
		};

		(policies.canAccessUserInfo as any).mockReset();
	});

	const makeSut = () => getUserFactory({ queriesRepository });

	it('should return user when access is allowed', async () => {
		(policies.canAccessUserInfo as any).mockReturnValue(true);

		queriesRepository.selectUserById = mock(() => Promise.resolve(fakeUser));

		const getUser = makeSut();

		const result = await getUser({
			targetId: 1,
			requesterId: 1,
			requesterRole: 'user' as UserRole,
		});

		expect(policies.canAccessUserInfo).toHaveBeenCalledWith({
			targetId: 1,
			requesterId: 1,
			requesterRole: 'user',
		});

		expect(queriesRepository.selectUserById).toHaveBeenCalledWith(1);
		expect(result).toEqual(fakeUser);
	});

	it('should throw CrossUserDataAccessError when access is denied', async () => {
		(policies.canAccessUserInfo as any).mockReturnValue(false);

		const getUser = makeSut();

		await expect(
			getUser({
				targetId: 2,
				requesterId: 1,
				requesterRole: 'user' as UserRole,
			}),
		).rejects.toBeInstanceOf(CrossUserDataAccessError);

		expect(policies.canAccessUserInfo).toHaveBeenCalled();
		expect(queriesRepository.selectUserById).not.toHaveBeenCalled();
	});

	it('should throw UserNotFoundError when user does not exist', () => {
		(policies.canAccessUserInfo as any).mockReturnValue(true);

		queriesRepository.selectUserById = mock(() => Promise.resolve(null));

		const getUser = makeSut();

		expect(
			getUser({
				targetId: 999,
				requesterId: 1,
				requesterRole: 'admin' as UserRole,
			}),
		).rejects.toBeInstanceOf(UserNotFoundError);

		expect(queriesRepository.selectUserById).toHaveBeenCalledWith(999);
	});

	it('should propagate unexpected repository errors', () => {
		(policies.canAccessUserInfo as any).mockReturnValue(true);

		queriesRepository.selectUserById = mock(() =>
			Promise.reject(new Error('db exploded')),
		);

		const getUser = makeSut();

		expect(
			getUser({
				targetId: 1,
				requesterId: 1,
				requesterRole: 'admin' as UserRole,
			}),
		).rejects.toThrow('db exploded');
	});
});
