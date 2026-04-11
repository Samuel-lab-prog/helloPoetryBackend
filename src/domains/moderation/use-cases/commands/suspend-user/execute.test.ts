import { describe, it, expect } from 'bun:test';
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domain-error/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import type { SuspendedUserResponse } from '../../../ports/models';
import { makeModerationScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Moderation', () => {
	describe('Suspend User', () => {
		it('suspends a user successfully', async () => {
			const suspendedResponse: SuspendedUserResponse = {
				id: 1,
				suspendedUserId: 2,
				reason: 'misconduct',
				moderatorId: 1,
				suspendedAt: new Date(),
				endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			};

			const scenario = makeModerationScenario()
				.withUser()
				.withNoActiveSuspension()
				.withSuspensionCreated(suspendedResponse);

			const result = await scenario.executeSuspendUser({
				userId: 2,
				reason: 'misconduct',
				requesterId: 1,
				requesterRole: 'moderator',
			});

			expect(result).toEqual(suspendedResponse);
			expect(
				scenario.mocks.usersContract.selectUserBasicInfo,
			).toHaveBeenCalledWith(2);
			expect(
				scenario.mocks.queriesRepository.selectActiveSuspensionByUserId,
			).toHaveBeenCalledWith({ userId: 2 });
			expect(
				scenario.mocks.commandsRepository.createSuspension,
			).toHaveBeenCalledWith({
				userId: 2,
				reason: 'misconduct',
				moderatorId: 1,
			});
		});

		it('does not allow suspending oneself', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeSuspendUser({
					userId: 1,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
				ForbiddenError,
			);

			expect(
				scenario.mocks.usersContract.selectUserBasicInfo,
			).not.toHaveBeenCalled();
			expect(
				scenario.mocks.commandsRepository.createSuspension,
			).not.toHaveBeenCalled();
		});

		it('throws InsufficientPermissionsError if requester is author', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeSuspendUser({
					userId: 2,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'author',
				}),
				ForbiddenError,
			);

			expect(
				scenario.mocks.usersContract.selectUserBasicInfo,
			).not.toHaveBeenCalled();
			expect(
				scenario.mocks.commandsRepository.createSuspension,
			).not.toHaveBeenCalled();
		});

		it('throws UserNotFoundError if user does not exist', async () => {
			const scenario = makeModerationScenario().withUser({ exists: false });

			await expectError(
				scenario.executeSuspendUser({
					userId: 99,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
				NotFoundError,
			);

			expect(
				scenario.mocks.commandsRepository.createSuspension,
			).not.toHaveBeenCalled();
		});

		it('throws UserAlreadySuspendedError if user already has an active suspension', async () => {
			const scenario = makeModerationScenario()
				.withUser()
				.withActiveSuspension();

			await expectError(scenario.executeSuspendUser(), ConflictError);

			expect(
				scenario.mocks.commandsRepository.createSuspension,
			).not.toHaveBeenCalled();
		});

		it('does not swallow dependency errors', async () => {
			const scenario = makeModerationScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeSuspendUser(), Error);
		});
	});
});
