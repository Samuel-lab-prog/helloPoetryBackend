import { describe, expect, it } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@TestUtils';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Users Management - GetPrivateProfile', () => {
	describe('Successful execution', () => {
		it('should return private profile', async () => {
			const scenario = makeUsersManagementScenario().withPrivateProfile();

			const result = await scenario.executeGetPrivateProfile();

			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('email');
		});
	});

	describe('User validation', () => {
		it('should throw ForbiddenError when requester is banned', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetPrivateProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
		});

		it('should not query repository when requester is banned (fail fast)', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetPrivateProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
			expect(
				scenario.mocks.queriesRepository.selectPrivateProfile,
			).not.toHaveBeenCalled();
		});
	});

	describe('Profile validation', () => {
		it('should throw NotFoundError when profile does not exist', async () => {
			const scenario =
				makeUsersManagementScenario().withPrivateProfileNotFound();

			await expectError(scenario.executeGetPrivateProfile(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makeUsersManagementScenario();
			scenario.mocks.queriesRepository.selectPrivateProfile.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeGetPrivateProfile(), Error);
		});
	});
});
