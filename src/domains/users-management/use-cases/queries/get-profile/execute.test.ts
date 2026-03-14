import { describe, expect, it } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Users Management - GetProfile', () => {
	describe('Successful execution', () => {
		it('should return private profile', async () => {
			const scenario = makeUsersManagementScenario().withProfile();

			const result = await scenario.executeGetProfile();

			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('email');
		});

		it('should enrich public profile with relation info', async () => {
			const scenario = makeUsersManagementScenario()
				.withPublicProfile()
				.withRelation({ requestSentByUserId: 1, friends: false });

			const result = await scenario.executeGetProfile({ id: 2 });

			expect(result).toHaveProperty('isFriendRequester', true);
			expect(result).toHaveProperty('hasIncomingFriendRequest', false);
		});
	});

	describe('User validation', () => {
		it('should throw ForbiddenError when requester is banned', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
		});

		it('should not query repository when requester is banned (fail fast)', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
			expect(
				scenario.mocks.queriesRepository.selectProfile,
			).not.toHaveBeenCalled();
		});
	});

	describe('Profile validation', () => {
		it('should throw NotFoundError when profile does not exist', async () => {
			const scenario = makeUsersManagementScenario().withProfileNotFound();

			await expectError(scenario.executeGetProfile(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makeUsersManagementScenario();
			scenario.mocks.queriesRepository.selectProfile.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeGetProfile(), Error);
		});
	});
});
