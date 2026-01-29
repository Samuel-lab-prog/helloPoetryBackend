import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { banUserFactory, type BanUserParams } from './execute';
import {
	UserNotFoundError,
	UserAlreadyBannedError,
	InsufficientPermissionsError,
	CannotBanSelfError,
} from '../Errors';

let commandsRepository: any;
let queriesRepository: any;
let usersContract: any;
let banUser: ReturnType<typeof banUserFactory>;

beforeEach(() => {
	commandsRepository = {
		createBan: mock(),
	};
	queriesRepository = {
		selectActiveBanByUserId: mock(),
	};
	usersContract = {
		getUserBasicInfo: mock(),
	};

	banUser = banUserFactory({
		commandsRepository,
		queriesRepository,
		usersContract,
	});
});

describe('banUser use case', () => {
	const params: BanUserParams = {
		userId: 2,
		reason: 'Violation of rules',
		requesterId: 1,
		requesterRole: 'moderator',
	};

	it('should successfully ban a user (happy path)', async () => {
		usersContract.getUserBasicInfo.mockResolvedValue({ exists: true });
		queriesRepository.selectActiveBanByUserId.mockResolvedValue(null);
		commandsRepository.createBan.mockResolvedValue({
			userId: params.userId,
			reason: params.reason,
			moderatorId: params.requesterId,
		});

		const result = await banUser(params);

		expect(result).toEqual(
			expect.objectContaining({
				userId: params.userId,
				reason: params.reason,
				moderatorId: params.requesterId,
			}),
		);
		expect(usersContract.getUserBasicInfo).toHaveBeenCalledWith(params.userId);
		expect(queriesRepository.selectActiveBanByUserId).toHaveBeenCalledWith({
			userId: params.userId,
		});
		expect(commandsRepository.createBan).toHaveBeenCalledWith({
			userId: params.userId,
			reason: params.reason,
			moderatorId: params.requesterId,
		});
	});

	it('should throw CannotBanSelfError if requester tries to ban themselves', async () => {
		const selfBanParams = { ...params, requesterId: params.userId };

		await expect(banUser(selfBanParams)).rejects.toThrow(CannotBanSelfError);
	});

	it('should throw InsufficientPermissionsError if requester role is user', async () => {
		const userRoleParams = { ...params, requesterRole: 'user' };

		await expect(banUser(userRoleParams)).rejects.toThrow(
			InsufficientPermissionsError,
		);
	});

	it('should throw UserNotFoundError if target user does not exist', async () => {
		usersContract.getUserBasicInfo.mockResolvedValue({ exists: false });

		await expect(banUser(params)).rejects.toThrow(UserNotFoundError);
	});

	it('should throw UserAlreadyBannedError if user already has an active ban', async () => {
		usersContract.getUserBasicInfo.mockResolvedValue({ exists: true });
		queriesRepository.selectActiveBanByUserId.mockResolvedValue({
			id: 123,
			userId: params.userId,
		});

		await expect(banUser(params)).rejects.toThrow(UserAlreadyBannedError);
	});

	it('should propagate errors from dependencies', async () => {
		usersContract.getUserBasicInfo.mockRejectedValue(
			new Error('Dependency failure'),
		);

		await expect(banUser(params)).rejects.toThrow('Dependency failure');
	});
});
