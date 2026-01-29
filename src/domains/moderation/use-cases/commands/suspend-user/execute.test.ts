import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { suspendUserFactory, type SuspendUserParams } from './execute';
import {
	UserNotFoundError,
	UserAlreadySuspendedError,
	InsufficientPermissionsError,
	CannotSuspendSelfError,
} from '../Errors';

let commandsRepository: any;
let queriesRepository: any;
let usersContract: any;
let suspendUser: ReturnType<typeof suspendUserFactory>;

beforeEach(() => {
	commandsRepository = {
		createSuspension: mock(),
	};
	queriesRepository = {
		selectActiveSuspensionByUserId: mock(),
	};
	usersContract = {
		getUserBasicInfo: mock(),
	};

	suspendUser = suspendUserFactory({
		commandsRepository,
		queriesRepository,
		usersContract,
	});
});

describe('suspendUser use case', () => {
	const params: SuspendUserParams = {
		userId: 2,
		reason: 'Violation of rules',
		requesterId: 1,
		requesterRole: 'moderator',
	};

	it('should successfully suspend a user (happy path)', async () => {
		usersContract.getUserBasicInfo.mockResolvedValue({ exists: true });
		queriesRepository.selectActiveSuspensionByUserId.mockResolvedValue(null);
		commandsRepository.createSuspension.mockResolvedValue({
			id: 1,
			userId: params.userId,
			reason: params.reason,
			moderatorId: params.requesterId,
			startAt: new Date(),
		});

		const result = await suspendUser(params);

		expect(result).toEqual({
			id: 1,
			userId: params.userId,
			reason: params.reason,
			moderatorId: params.requesterId,
			startAt: expect.any(Date),
		});
		expect(usersContract.getUserBasicInfo).toHaveBeenCalledWith(params.userId);
		expect(
			queriesRepository.selectActiveSuspensionByUserId,
		).toHaveBeenCalledWith({ userId: params.userId });
		expect(commandsRepository.createSuspension).toHaveBeenCalledWith({
			userId: params.userId,
			reason: params.reason,
			moderatorId: params.requesterId,
		});
	});

	it('should throw CannotSuspendSelfError if requester tries to suspend themselves', async () => {
		const selfSuspendParams = { ...params, requesterId: params.userId };

		await expect(suspendUser(selfSuspendParams)).rejects.toThrow(
			CannotSuspendSelfError,
		);
	});

	it('should throw InsufficientPermissionsError if requester role is user', async () => {
		const userRoleParams = { ...params, requesterRole: 'user' };

		await expect(suspendUser(userRoleParams)).rejects.toThrow(
			InsufficientPermissionsError,
		);
	});

	it('should throw UserNotFoundError if target user does not exist', async () => {
		usersContract.getUserBasicInfo.mockResolvedValue({ exists: false });

		await expect(suspendUser(params)).rejects.toThrow(UserNotFoundError);
	});

	it('should throw UserAlreadySuspendedError if user already has an active suspension', async () => {
		usersContract.getUserBasicInfo.mockResolvedValue({ exists: true });
		queriesRepository.selectActiveSuspensionByUserId.mockResolvedValue({
			id: 123,
			userId: params.userId,
		});

		await expect(suspendUser(params)).rejects.toThrow(
			UserAlreadySuspendedError,
		);
	});

	it('should propagate errors from dependencies', async () => {
		usersContract.getUserBasicInfo.mockRejectedValue(
			new Error('Dependency failure'),
		);

		await expect(suspendUser(params)).rejects.toThrow('Dependency failure');
	});
});
