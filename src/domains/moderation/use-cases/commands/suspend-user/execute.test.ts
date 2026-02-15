import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { suspendUserFactory } from './execute';
import {
	UserNotFoundError,
	UserAlreadySuspendedError,
	InsufficientPermissionsError,
	CannotSuspendSelfError,
} from '../../Errors';
import type { SuspendedUserResponse } from '../../Models';

describe('USE-CASE - Moderation', () => {
	describe('Suspend User', () => {
		let commandsRepository: any;
		let queriesRepository: any;
		let usersContract: any;

		beforeEach(() => {
			commandsRepository = {
				createSuspension: mock(),
				createBan: mock(),
			};
			queriesRepository = {
				selectActiveSuspensionByUserId: mock(),
				selectActiveBanByUserId: mock(),
			};
			usersContract = {
				selectUserBasicInfo: mock(),
			};
		});

		it('suspends a user successfully', async () => {
			const suspendedResponse: SuspendedUserResponse = {
				id: 1,
				suspendedUserId: 2,
				reason: 'misconduct',
				moderatorId: 1,
				suspendedAt: new Date(),
				endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days suspension
			};

			usersContract.selectUserBasicInfo.mockResolvedValue({ exists: true });
			queriesRepository.selectActiveSuspensionByUserId.mockResolvedValue(null);
			commandsRepository.createSuspension.mockResolvedValue(suspendedResponse);

			const suspendUser = suspendUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			const result = await suspendUser({
				userId: 2,
				reason: 'misconduct',
				requesterId: 1,
				requesterRole: 'moderator',
			});

			expect(result).toEqual(suspendedResponse);
			expect(usersContract.selectUserBasicInfo).toHaveBeenCalledWith(2);
			expect(
				queriesRepository.selectActiveSuspensionByUserId,
			).toHaveBeenCalledWith({ userId: 2 });
			expect(commandsRepository.createSuspension).toHaveBeenCalledWith({
				userId: 2,
				reason: 'misconduct',
				moderatorId: 1,
			});
		});

		it('does not allow suspending oneself', async () => {
			const suspendUser = suspendUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				suspendUser({
					userId: 1,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toBeInstanceOf(CannotSuspendSelfError);

			expect(usersContract.selectUserBasicInfo).not.toHaveBeenCalled();
			expect(commandsRepository.createSuspension).not.toHaveBeenCalled();
		});

		it('throws InsufficientPermissionsError if requester is author', async () => {
			const suspendUser = suspendUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				suspendUser({
					userId: 2,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'author',
				}),
			).rejects.toBeInstanceOf(InsufficientPermissionsError);

			expect(usersContract.selectUserBasicInfo).not.toHaveBeenCalled();
			expect(commandsRepository.createSuspension).not.toHaveBeenCalled();
		});

		it('throws UserNotFoundError if user does not exist', async () => {
			usersContract.selectUserBasicInfo.mockResolvedValue({ exists: false });

			const suspendUser = suspendUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				suspendUser({
					userId: 99,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toBeInstanceOf(UserNotFoundError);

			expect(commandsRepository.createSuspension).not.toHaveBeenCalled();
		});

		it('throws UserAlreadySuspendedError if user already has an active suspension', async () => {
			usersContract.selectUserBasicInfo.mockResolvedValue({ exists: true });
			queriesRepository.selectActiveSuspensionByUserId.mockResolvedValue({
				userId: 2,
				reason: 'misconduct',
				moderatorId: 1,
			});

			const suspendUser = suspendUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				suspendUser({
					userId: 2,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toBeInstanceOf(UserAlreadySuspendedError);

			expect(commandsRepository.createSuspension).not.toHaveBeenCalled();
		});

		it('does not swallow dependency errors', async () => {
			usersContract.selectUserBasicInfo.mockRejectedValue(new Error('boom'));

			const suspendUser = suspendUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				suspendUser({
					userId: 2,
					reason: 'misconduct',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toThrow('boom');
		});
	});
});
