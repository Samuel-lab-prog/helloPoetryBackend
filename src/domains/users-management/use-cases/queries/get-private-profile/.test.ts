import { describe, it, expect, vi, beforeEach } from 'bun:test';

import { getPrivateProfileFactory } from './execute';
import { ProfileNotFoundError } from '../errors';

import type { userQueriesRepository } from '../../../ports/QueriesRepository';
import type { PrivateProfile } from '../read-models/PrivateProfile';

describe('getPrivateProfileFactory', () => {
	let userQueriesRepository: userQueriesRepository;

	const fakeProfile: PrivateProfile = {
		id: 1,
		nickname: 'samuel',
		email: 'samuel@email.com',
		bio: 'Average poetry lover',
		avatarUrl: 'http://avatar.url/samuel.png',
		name: 'Samuel Johnson',
		role: 'user',
		status: 'active',
		emailVerifiedAt: new Date('2023-01-03T00:00:00Z'),
		stats: {
			poemsCount: 10,
			commentsCount: 25,
			friendsCount: 5,
			poemsIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		},
		friendshipRequests: [
			{
				status: 'pending',
				isRequester: true,
				userId: 2,
			},
		],
	};

	beforeEach(() => {
		userQueriesRepository = {
			selectPrivateProfile: vi.fn(),
			selectAuthUserByEmail: vi.fn(),
			selectUserByEmail: vi.fn(),
			selectUserById: vi.fn(),
			selectUserByNickname: vi.fn(),
			selectPublicProfile: vi.fn(),
			selectUsers: vi.fn(),
		};
	});

	it('should return private profile when it exists', async () => {
		userQueriesRepository.selectPrivateProfile = vi
			.fn()
			.mockResolvedValue(fakeProfile);

		const getPrivateProfile = getPrivateProfileFactory({
			userQueriesRepository,
		});

		const result = await getPrivateProfile(1);

		expect(userQueriesRepository.selectPrivateProfile).toHaveBeenCalledWith(1);
		expect(result).toEqual(fakeProfile);
	});

	it('should throw ProfileNotFoundError when profile does not exist', async () => {
		userQueriesRepository.selectPrivateProfile = vi
			.fn()
			.mockResolvedValue(null);

		const getPrivateProfile = getPrivateProfileFactory({
			userQueriesRepository,
		});

		await expect(getPrivateProfile(999)).rejects.toBeInstanceOf(
			ProfileNotFoundError,
		);

		expect(userQueriesRepository.selectPrivateProfile).toHaveBeenCalledWith(
			999,
		);
	});

	it('should propagate unexpected repository errors', async () => {
		userQueriesRepository.selectPrivateProfile = vi
			.fn()
			.mockRejectedValue(new Error('database down'));

		const getPrivateProfile = getPrivateProfileFactory({
			userQueriesRepository,
		});

		await expect(getPrivateProfile(1)).rejects.toThrow('database down');
	});
});
