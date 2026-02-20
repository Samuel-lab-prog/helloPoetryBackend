import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { acceptFriendRequestFactory } from './execute';

import { ConflictError, NotFoundError } from '@DomainError';

describe('USE-CASE - Friends Management', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let acceptFriendRequest: any;
	let usersContract: any;

	beforeEach(() => {
		commandsRepository = {
			acceptFriendRequest: mock(),
		};

		queriesRepository = {
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
			findBlockedRelationship: mock(),
		};
		usersContract = {
			selectUserBasicInfo: mock(),
		} as any;

		acceptFriendRequest = acceptFriendRequestFactory({
			commandsRepository,
			queriesRepository,
			usersContract: usersContract,
		});
	});

	describe('Accept Friend Request', () => {
		it('Does not allow self request', () => {
			expect(
				acceptFriendRequest({ requesterId: 1, addresseeId: 1 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Does not allow accept the request if the friendship already exists', () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({
				id: 10,
			});

			expect(
				acceptFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(ConflictError);

			expect(queriesRepository.findFriendshipBetweenUsers).toHaveBeenCalledWith(
				{
					user1Id: 1,
					user2Id: 2,
				},
			);
		});

		it('Does not allow accept the request if the friend request does not exist', () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValue(null);

			expect(
				acceptFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(NotFoundError);

			expect(queriesRepository.findFriendRequest).toHaveBeenCalledWith({
				requesterId: 1,
				addresseeId: 2,
			});
		});

		it('Does not allow accept the request if one of the users has blocked the other', () => {
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
			queriesRepository.findBlockedRelationship.mockResolvedValue(true);

			expect(
				acceptFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(ConflictError);

			expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith({
				userId1: 1,
				userId2: 2,
			});
		});

		it('Should accept the friend request and return the result when no errors occur', async () => {
			const acceptedRequest = { id: 30 };

			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValue({ id: 20 });
			queriesRepository.findBlockedRelationship.mockResolvedValue(false);
			usersContract.selectUserBasicInfo.mockResolvedValue({ nickname: 'John' });

			commandsRepository.acceptFriendRequest.mockResolvedValue({
				ok: true,
				data: acceptedRequest,
			});

			const result = await acceptFriendRequest({
				requesterId: 1,
				addresseeId: 2,
			});

			expect(result).toEqual(acceptedRequest);
			expect(commandsRepository.acceptFriendRequest).toHaveBeenCalledWith(1, 2);
		});
	});
});
