import { describe, it, expect, vi, beforeEach } from 'bun:test';

import { getPublicProfileFactory } from './execute';
import { ProfileNotFoundError } from '../Errors';

import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { PublicProfile } from '../../queries/models/Index';

describe('getPublicProfileFactory', () => {
	let queriesRepository: QueriesRepository;
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
		isFriend: false,
		isBlocked: false,
	};

	beforeEach(() => {
		queriesRepository = {
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
		queriesRepository.selectPublicProfile = vi
			.fn()
			.mockResolvedValue(fakePublicProfile);

		const getPublicProfile = getPublicProfileFactory({
			queriesRepository,
		});

		const result = await getPublicProfile(1);

		expect(queriesRepository.selectPublicProfile).toHaveBeenCalledWith(
			1,
			undefined,
		);
		expect(result).toEqual(fakePublicProfile);
	});

	it('should return public profile with requesterId', async () => {
		queriesRepository.selectPublicProfile = vi.fn().mockResolvedValue({
			...fakePublicProfile,
			isFriend: true,
		});

		const getPublicProfile = getPublicProfileFactory({
			queriesRepository,
		});

		await getPublicProfile(1, 42);

		expect(queriesRepository.selectPublicProfile).toHaveBeenCalledWith(1, 42);
	});

	it('should throw ProfileNotFoundError when profile does not exist', async () => {
		queriesRepository.selectPublicProfile = vi.fn().mockResolvedValue(null);

		const getPublicProfile = getPublicProfileFactory({
			queriesRepository,
		});

		await expect(getPublicProfile(999)).rejects.toBeInstanceOf(
			ProfileNotFoundError,
		);

		expect(queriesRepository.selectPublicProfile).toHaveBeenCalledWith(
			999,
			undefined,
		);
	});

	it('should propagate unexpected repository errors', async () => {
		queriesRepository.selectPublicProfile = vi
			.fn()
			.mockRejectedValue(new Error('database down'));

		const getPublicProfile = getPublicProfileFactory({
			queriesRepository,
		});

		await expect(getPublicProfile(1)).rejects.toThrow('database down');
	});
});
