import { describe, it, expect, vi, beforeEach } from 'bun:test';

import { getPrivateProfileFactory } from './execute';
import { ProfileNotFoundError } from '../Errors';

import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { PrivateProfile } from '../models/Index';

describe('getPrivateProfileFactory', () => {
	let queriesRepository: QueriesRepository;
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
		friendsIds: [2, 3, 4],
		stats: {
			commentsIds: [
				1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
				21, 22, 23, 24, 25,
			],
			friendsIds: [2, 3, 4, 5],
			poemsIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		},
		friendshipRequestsReceived: [
			{
				requesterId: 5,
				requesterNickname: 'alice',
				requesterAvatarUrl: 'http://avatar.url/alice.png',
			},
		],
		friendshipRequestsSent: [
			{
				adresseeId: 6,
				adreseeNickname: 'bob',
				adresseeAvatarUrl: 'http://avatar.url/bob.png',
			},
		],
	};

	beforeEach(() => {
		queriesRepository = {
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
		queriesRepository.selectPrivateProfile = vi
			.fn()
			.mockResolvedValue(fakeProfile);

		const getPrivateProfile = getPrivateProfileFactory({
			queriesRepository,
		});

		const result = await getPrivateProfile(1);

		expect(queriesRepository.selectPrivateProfile).toHaveBeenCalledWith(1);
		expect(result).toEqual(fakeProfile);
	});

	it('should throw ProfileNotFoundError when profile does not exist', async () => {
		queriesRepository.selectPrivateProfile = vi.fn().mockResolvedValue(null);

		const getPrivateProfile = getPrivateProfileFactory({
			queriesRepository,
		});

		await expect(getPrivateProfile(999)).rejects.toBeInstanceOf(
			ProfileNotFoundError,
		);

		expect(queriesRepository.selectPrivateProfile).toHaveBeenCalledWith(999);
	});

	it('should propagate unexpected repository errors', async () => {
		queriesRepository.selectPrivateProfile = vi
			.fn()
			.mockRejectedValue(new Error('database down'));

		const getPrivateProfile = getPrivateProfileFactory({
			queriesRepository,
		});

		await expect(getPrivateProfile(1)).rejects.toThrow('database down');
	});
});
