import { describe, it, expect, mock } from 'bun:test';

import { getPublicProfileFactory } from './execute';

import type { QueriesRepository } from '../../../ports/QueriesRepository';

import {
	ProfileNotFoundError,
	UserBannedError,
} from '../../Errors';

describe('USE-CASE - Users Management', () => {
	const selectPublicProfile = mock();

	const queriesRepository: QueriesRepository = {
		selectPublicProfile,
		selectPrivateProfile: mock(),
		selectUsers: mock(),
    selectAuthUserByEmail: mock(),
    selectUserByEmail: mock(),
    selectUserById: mock(),
    selectUserByNickname: mock(),
	};

	const getPublicProfile: ReturnType<
		typeof getPublicProfileFactory
	> = getPublicProfileFactory({
		queriesRepository,
	});

	describe('Get Public Profile', () => {
		it('Does not allow banned users to access public profiles', () => {
			expect(
				getPublicProfile({
					id: 2,
					requesterId: 1,
					requesterRole: 'admin',
					requesterStatus: 'banned',
				}),
			).rejects.toThrow(UserBannedError);
		});

		it('Throws error when profile is not found', () => {
			selectPublicProfile.mockResolvedValueOnce(null);

			expect(
				getPublicProfile({
					id: 2,
					requesterId: 1,
					requesterRole: 'admin',
					requesterStatus: 'active',
				}),
			).rejects.toThrow(ProfileNotFoundError);
		});

		it('Successfully returns public profile', async () => {
			const profile = {
				id: 2,
				nickname: 'john',
				bio: 'hello world',
			};

			selectPublicProfile.mockResolvedValueOnce(profile);

			const result = await getPublicProfile({
				id: 2,
				requesterId: 1,
				requesterRole: 'admin',
				requesterStatus: 'active',
			});

			expect(result).not.toBeNull();
			expect(result).toHaveProperty('id', 2);
			expect(result).toHaveProperty('nickname', 'john');
		});
	});
});
