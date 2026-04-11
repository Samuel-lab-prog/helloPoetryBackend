import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domain-error/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { makeModerationScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Moderation', () => {
	describe('Get User Sanction Status', () => {
		it('returns active sanctions for a user', async () => {
			const scenario = makeModerationScenario().withUser();
			scenario.mocks.queriesRepository.selectActiveBanByUserId.mockResolvedValue(
				null,
			);
			scenario.mocks.queriesRepository.selectActiveSuspensionByUserId.mockResolvedValue(
				null,
			);

			const result = await scenario.executeGetUserSanctionStatus({
				userId: 2,
				requesterId: 1,
				requesterRole: 'moderator',
				requesterStatus: 'active',
			});

			expect(result).toEqual({ activeBan: null, activeSuspension: null });
		});

		it('throws ForbiddenError when requester is not active', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeGetUserSanctionStatus({
					requesterStatus: 'banned',
				}),
				ForbiddenError,
			);
		});

		it('throws ForbiddenError if requester is author', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeGetUserSanctionStatus({
					requesterRole: 'author',
				}),
				ForbiddenError,
			);
		});

		it('throws NotFoundError if user does not exist', async () => {
			const scenario = makeModerationScenario().withUser({ exists: false });

			await expectError(
				scenario.executeGetUserSanctionStatus({
					userId: 99,
				}),
				NotFoundError,
			);
		});
	});
});
