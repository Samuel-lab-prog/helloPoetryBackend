import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { sendFriendRequestFactory } from './execute';
import {
	SelfReferenceError,
	FriendshipAlreadyExistsError,
	RequestAlreadySentError,
	UserBlockedError,
} from '../../Errors';

describe('USE-CASE - Friends Management', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let sendFriendRequest: any;

	beforeEach(() => {
		commandsRepository = {
			createFriendRequest: mock(),
			acceptFriendRequest: mock(),
		};

		queriesRepository = {
			findBlockedRelationship: mock(),
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
		};

		sendFriendRequest = sendFriendRequestFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	describe('Send Friend Request', () => {
		it('Does not allow self reference', () => {
			expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 1 }),
			).rejects.toBeInstanceOf(SelfReferenceError);
		});

		it('Should abort when users are blocked', () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue({ id: 1 });

			expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(UserBlockedError);
		});

		it('Should abort when friendship already exists', () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 5 });

			expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(FriendshipAlreadyExistsError);
		});

		it('Should abort when outgoing request already exists', () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValueOnce({ id: 10 });

			expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(RequestAlreadySentError);
		});

		it('Should accept request when incoming request exists', () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest
				.mockResolvedValueOnce(null) // outgoing
				.mockResolvedValueOnce({ id: 20 }); // incoming

			commandsRepository.acceptFriendRequest.mockResolvedValue({
				ok: true,
				data: { id: 30 },
			});

			expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).resolves.toEqual({ id: 30 });
		});

		it('Should create friend request when no errors occur', () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest
				.mockResolvedValueOnce(null) // outgoing
				.mockResolvedValueOnce(null); // incoming

			commandsRepository.createFriendRequest.mockResolvedValue({
				ok: true,
				data: { id: 40 },
			});

			expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).resolves.toEqual({ id: 40 });
		});
	});
});
