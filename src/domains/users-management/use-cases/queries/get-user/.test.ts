/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { getUserFactory } from './execute';
import { UserNotFoundError, CrossUserDataAccessError } from '../errors';

import * as policies from '../policies/policies';

import type { userQueriesRepository } from '../../../ports/QueriesRepository';
import type { FullUser } from '../read-models/FullUser';
import type { userRole } from '../../../use-cases/queries/read-models/Enums';

mock.module('../policies/policies', () => ({
	canAccessUserInfo: mock(() => true),
}));

describe('getUserFactory', () => {
	let userQueriesRepository: userQueriesRepository;

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
	};

	beforeEach(() => {
		userQueriesRepository = {
			selectPrivateProfile: mock(),
			selectPublicProfile: mock(),
			selectAuthUserByEmail: mock(),
			selectUserByEmail: mock(),
			selectUserById: mock(),
			selectUserByNickname: mock(),
			selectUsers: mock(),
		};

		// reset do comportamento da policy
		(policies.canAccessUserInfo as any).mockReset();
	});

	it('should return user when access is allowed', async () => {
		(policies.canAccessUserInfo as any).mockReturnValue(true);

		userQueriesRepository.selectUserById = mock(() =>
			Promise.resolve(fakeUser),
		);

		const getUser = getUserFactory({ userQueriesRepository });

		const result = await getUser({
			targetId: 1,
			requesterId: 1,
			requesterRole: 'user' as userRole,
		});

		expect(policies.canAccessUserInfo).toHaveBeenCalledWith({
			targetId: 1,
			requesterId: 1,
			requesterRole: 'user',
		});

		expect(userQueriesRepository.selectUserById).toHaveBeenCalledWith(1);
		expect(result).toEqual(fakeUser);
	});

	it('should throw CrossUserDataAccessError when access is denied', async () => {
		(policies.canAccessUserInfo as any).mockReturnValue(false);

		const getUser = getUserFactory({ userQueriesRepository });

		await expect(
			getUser({
				targetId: 2,
				requesterId: 1,
				requesterRole: 'user' as userRole,
			}),
		).rejects.toBeInstanceOf(CrossUserDataAccessError);

		expect(policies.canAccessUserInfo).toHaveBeenCalled();
		expect(userQueriesRepository.selectUserById).not.toHaveBeenCalled();
	});

	it('should throw UserNotFoundError when user does not exist', async () => {
		(policies.canAccessUserInfo as any).mockReturnValue(true);

		userQueriesRepository.selectUserById = mock(() => Promise.resolve(null));

		const getUser = getUserFactory({ userQueriesRepository });

		await expect(
			getUser({
				targetId: 999,
				requesterId: 1,
				requesterRole: 'admin' as userRole,
			}),
		).rejects.toBeInstanceOf(UserNotFoundError);

		expect(userQueriesRepository.selectUserById).toHaveBeenCalledWith(999);
	});

	it('should propagate unexpected repository errors', async () => {
		(policies.canAccessUserInfo as any).mockReturnValue(true);

		userQueriesRepository.selectUserById = mock(() =>
			Promise.reject(new Error('db exploded')),
		);

		const getUser = getUserFactory({ userQueriesRepository });

		await expect(
			getUser({
				targetId: 1,
				requesterId: 1,
				requesterRole: 'admin' as userRole,
			}),
		).rejects.toThrow('db exploded');
	});
});
