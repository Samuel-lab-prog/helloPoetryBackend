import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { banUserFactory } from './execute';
import {
	UserNotFoundError,
	UserAlreadyBannedError,
	InsufficientPermissionsError,
	CannotBanSelfError,
} from '../../Errors';
import type { BannedUserResponse } from '../../Models';

describe('USE-CASE - Moderation', () => {
	describe('Ban User', () => {
		let commandsRepository: any;
		let queriesRepository: any;
		let usersContract: any;

		beforeEach(() => {
			commandsRepository = {
				createBan: mock(),
				createSuspension: mock(),
			};
			queriesRepository = {
				selectActiveBanByUserId: mock(),
				selectActiveSuspensionByUserId: mock(),
			};
			usersContract = {
				selectUserBasicInfo: mock(),
			};
		});

		it('bans a user successfully', async () => {
			const bannedResponse: BannedUserResponse = {
				id: 1,
				bannedUserId: 2,
				reason: 'spam',
				moderatorId: 1,
				bannedAt: new Date(),
			};

			usersContract.selectUserBasicInfo.mockResolvedValue({ exists: true });
			queriesRepository.selectActiveBanByUserId.mockResolvedValue(null);
			commandsRepository.createBan.mockResolvedValue(bannedResponse);

			const banUser = banUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			const result = await banUser({
				userId: 2,
				reason: 'spam',
				requesterId: 1,
				requesterRole: 'moderator',
			});

			expect(result).toEqual(bannedResponse);
			expect(usersContract.selectUserBasicInfo).toHaveBeenCalledWith(2);
			expect(queriesRepository.selectActiveBanByUserId).toHaveBeenCalledWith({
				userId: 2,
			});
			expect(commandsRepository.createBan).toHaveBeenCalledWith({
				userId: 2,
				reason: 'spam',
				moderatorId: 1,
			});
		});

		it('Does not allow banning oneself', async () => {
			const banUser = banUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				banUser({
					userId: 1,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toBeInstanceOf(CannotBanSelfError);

			expect(usersContract.selectUserBasicInfo).not.toHaveBeenCalled();
			expect(commandsRepository.createBan).not.toHaveBeenCalled();
		});

		it('throws InsufficientPermissionsError if requester is author', async () => {
			const banUser = banUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				banUser({
					userId: 2,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'author',
				}),
			).rejects.toBeInstanceOf(InsufficientPermissionsError);

			expect(usersContract.selectUserBasicInfo).not.toHaveBeenCalled();
			expect(commandsRepository.createBan).not.toHaveBeenCalled();
		});

		it('throws UserNotFoundError if user does not exist', async () => {
			usersContract.selectUserBasicInfo.mockResolvedValue({ exists: false });

			const banUser = banUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				banUser({
					userId: 99,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toBeInstanceOf(UserNotFoundError);

			expect(commandsRepository.createBan).not.toHaveBeenCalled();
		});

		it('throws UserAlreadyBannedError if user already has an active ban', async () => {
			usersContract.selectUserBasicInfo.mockResolvedValue({ exists: true });
			queriesRepository.selectActiveBanByUserId.mockResolvedValue({
				userId: 2,
				reason: 'spam',
				moderatorId: 1,
			});

			const banUser = banUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				banUser({
					userId: 2,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toBeInstanceOf(UserAlreadyBannedError);

			expect(commandsRepository.createBan).not.toHaveBeenCalled();
		});

		it('does not swallow dependency errors', async () => {
			usersContract.selectUserBasicInfo.mockRejectedValue(new Error('boom'));

			const banUser = banUserFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				banUser({
					userId: 2,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
			).rejects.toThrow('boom');
		});
	});
});
