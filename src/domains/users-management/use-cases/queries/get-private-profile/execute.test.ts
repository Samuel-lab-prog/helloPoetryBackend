import { describe, it, expect, mock } from 'bun:test';

import { getPrivateProfileFactory } from './execute';

import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { UserStatus } from '@PrismaGenerated/enums';

import { ProfileNotFoundError, UserBannedError } from '../../Errors';

describe('USE-CASE - Users Management', () => {
	const selectPrivateProfile = mock();

	const queriesRepository: QueriesRepository = {
		selectPrivateProfile,
		selectAuthUserByEmail: mock(),
		selectPublicProfile: mock(),
		selectUserByEmail: mock(),
		selectUserById: mock(),
		selectUserByNickname: mock(),
		selectUsers: mock(),
	};

	const getPrivateProfile: ReturnType<typeof getPrivateProfileFactory> =
		getPrivateProfileFactory({
			queriesRepository,
		});

	describe('Get Private Profile', () => {
		it('Does not allow banned users to access private profile', () => {
			expect(
				getPrivateProfile({
					requesterId: 1,
					requesterStatus: 'banned' as UserStatus,
				}),
			).rejects.toThrow(UserBannedError);
		});

		it('Throws error when profile is not found', () => {
			selectPrivateProfile.mockResolvedValueOnce(null);

			expect(
				getPrivateProfile({
					requesterId: 1,
					requesterStatus: 'active' as UserStatus,
				}),
			).rejects.toThrow(ProfileNotFoundError);
		});

		it('Successfully returns private profile', async () => {
			const profile = {
				id: 1,
				nickname: 'john',
				email: 'john@email.com',
				status: 'active',
			};

			selectPrivateProfile.mockResolvedValueOnce(profile);

			const result = await getPrivateProfile({
				requesterId: 1,
				requesterStatus: 'active' as UserStatus,
			});

			expect(result).not.toBeNull();
			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('nickname', 'john');
			expect(result).toHaveProperty('email', 'john@email.com');
		});
	});
});
