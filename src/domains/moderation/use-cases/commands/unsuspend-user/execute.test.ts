import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domain-error/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { makeModerationScenario } from '../../test-helpers/Helper';
import { givenSuspensionEnded } from '../../test-helpers/Givens';

describe('USE-CASE - Moderation', () => {
	describe('Unsuspend User', () => {
		it('unsuspends a user successfully', async () => {
			const scenario = makeModerationScenario()
				.withUser()
				.withActiveSuspension();

			givenSuspensionEnded(scenario.mocks.commandsRepository);

			await scenario.executeUnsuspendUser({
				userId: 2,
				requesterId: 1,
				requesterRole: 'moderator',
			});

			expect(
				scenario.mocks.queriesRepository.selectActiveSuspensionByUserId,
			).toHaveBeenCalledWith({ userId: 2 });
			expect(
				scenario.mocks.commandsRepository.endSuspension,
			).toHaveBeenCalled();
		});

		it('does not allow unsuspending oneself', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnsuspendUser({
					userId: 1,
					requesterId: 1,
					requesterRole: 'moderator',
				}),
				ForbiddenError,
			);
		});

		it('throws ForbiddenError when requester is not active', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnsuspendUser({
					requesterStatus: 'banned',
				}),
				ForbiddenError,
			);
		});

		it('throws ForbiddenError if requester is author', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnsuspendUser({
					requesterRole: 'author',
				}),
				ForbiddenError,
			);
		});

		it('throws NotFoundError if user does not exist', async () => {
			const scenario = makeModerationScenario().withUser({ exists: false });

			await expectError(
				scenario.executeUnsuspendUser({
					userId: 99,
				}),
				NotFoundError,
			);
		});

		it('throws NotFoundError if user is not suspended', async () => {
			const scenario = makeModerationScenario()
				.withUser()
				.withNoActiveSuspension();

			await expectError(scenario.executeUnsuspendUser(), NotFoundError);
		});
	});
});
