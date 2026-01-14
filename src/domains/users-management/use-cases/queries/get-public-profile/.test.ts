import { describe, it, expect, vi, beforeEach } from 'bun:test';

import { getPublicProfileFactory } from './execute';
import { ProfileNotFoundError } from '../errors';

import type { userQueriesRepository } from '../../../ports/QueriesRepository';
import type { PublicProfile } from '../read-models/PublicProfile';

describe('getPublicProfileFactory', () => {
	let userQueriesRepository: userQueriesRepository;

	const fakePublicProfile: PublicProfile = {
		id: 1,
		nickname: 'samuel',
		bio: 'Average poetry lover',
		avatarUrl: 'http://avatar.url/samuel.png',
		name: 'Samuel Johnson',
		role: 'user',
		status: 'active',
		stats: {
			poemsCount: 10,
			commentsCount: 25,
			friendsCount: 5,
		},
		friendship: {
			status: 'none',
			isRequester: false,
		},
	};

	beforeEach(() => {
		userQueriesRepository = {
			selectPrivateProfile: vi.fn(),
			selectPublicProfile: vi.fn(),
			selectAuthUserByEmail: vi.fn(),
			selectUserByEmail: vi.fn(),
			selectUserById: vi.fn(),
			selectUserByNickname: vi.fn(),
			selectUsers: vi.fn(),
		};
	});

	it('should return public profile without requesterId', async () => {
		userQueriesRepository.selectPublicProfile = vi
			.fn()
			.mockResolvedValue(fakePublicProfile);

		const getPublicProfile = getPublicProfileFactory({
			userQueriesRepository,
		});

		const result = await getPublicProfile(1);

		expect(userQueriesRepository.selectPublicProfile).toHaveBeenCalledWith(
			1,
			undefined,
		);
		expect(result).toEqual(fakePublicProfile);
	});

	it('should return public profile with requesterId', async () => {
		userQueriesRepository.selectPublicProfile = vi.fn().mockResolvedValue({
			...fakePublicProfile,
			isFriend: true,
		});

		const getPublicProfile = getPublicProfileFactory({
			userQueriesRepository,
		});

		const result = await getPublicProfile(1, 42);

		expect(userQueriesRepository.selectPublicProfile).toHaveBeenCalledWith(
			1,
			42,
		);
		expect(result.friendship.status).toBe('none');
	});

	it('should throw ProfileNotFoundError when profile does not exist', async () => {
		userQueriesRepository.selectPublicProfile = vi.fn().mockResolvedValue(null);

		const getPublicProfile = getPublicProfileFactory({
			userQueriesRepository,
		});

		await expect(getPublicProfile(999)).rejects.toBeInstanceOf(
			ProfileNotFoundError,
		);

		expect(userQueriesRepository.selectPublicProfile).toHaveBeenCalledWith(
			999,
			undefined,
		);
	});

	it('should propagate unexpected repository errors', async () => {
		userQueriesRepository.selectPublicProfile = vi
			.fn()
			.mockRejectedValue(new Error('database down'));

		const getPublicProfile = getPublicProfileFactory({
			userQueriesRepository,
		});

		await expect(getPublicProfile(1)).rejects.toThrow('database down');
	});
});
