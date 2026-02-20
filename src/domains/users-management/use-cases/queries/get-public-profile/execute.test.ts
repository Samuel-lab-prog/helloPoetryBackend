import { describe, expect, it } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@TestUtils';
import {
	DEFAULT_PUBLIC_PROFILE_ID,
	DEFAULT_REQUESTER_ID,
} from '../../test-helpers/Constants';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Users Management - GetPublicProfile', () => {
	describe('Successful execution', () => {
		it('should return public profile', async () => {
			const scenario = makeUsersManagementScenario().withPublicProfile();

			const result = await scenario.executeGetPublicProfile();

			expect(result).toHaveProperty('id', 2);
		});

		it('should query profile using target user id and requester id', async () => {
			const scenario = makeUsersManagementScenario().withPublicProfile();

			await scenario.executeGetPublicProfile();

			expect(
				scenario.mocks.queriesRepository.selectPublicProfile,
			).toHaveBeenCalledWith(DEFAULT_PUBLIC_PROFILE_ID, DEFAULT_REQUESTER_ID);
		});
	});

	describe('User validation', () => {
		it('should throw ForbiddenError when requester is banned', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetPublicProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
		});

		it('should not query repository when requester is banned (fail fast)', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetPublicProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
			expect(
				scenario.mocks.queriesRepository.selectPublicProfile,
			).not.toHaveBeenCalled();
		});
	});

	describe('Profile validation', () => {
		it('should throw NotFoundError when profile does not exist', async () => {
			const scenario =
				makeUsersManagementScenario().withPublicProfileNotFound();

			await expectError(scenario.executeGetPublicProfile(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makeUsersManagementScenario();
			scenario.mocks.queriesRepository.selectPublicProfile.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeGetPublicProfile(), Error);
		});
	});
});
