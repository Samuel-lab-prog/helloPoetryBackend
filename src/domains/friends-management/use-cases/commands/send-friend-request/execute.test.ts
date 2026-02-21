import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { sendFriendRequestFactory } from './execute';
import { ConflictError } from '@DomainError';
import { eventBus } from '@SharedKernel/events/EventBus';

describe('USE-CASE - Friends Management', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let usersContract: any;
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

		// 🚨 Mock atualizado para incluir nickname e status
		usersContract = {
			selectUserBasicInfo: mock().mockResolvedValue({
				id: 2,
				nickname: 'TestUser',
				status: 'active',
			}),
		} as any;

		sendFriendRequest = sendFriendRequestFactory({
			commandsRepository,
			queriesRepository,
			usersContract,
			eventBus: eventBus,
		});
	});

	describe('Send Friend Request', () => {
		it('Does not allow self reference', async () => {
			await expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 1 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Should abort when users are blocked', async () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue({ id: 1 });

			await expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Should abort when friendship already exists', async () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue({ id: 5 });

			await expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Should abort when outgoing request already exists', async () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest.mockResolvedValueOnce({ id: 10 });

			await expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).rejects.toBeInstanceOf(ConflictError);
		});

		it('Should accept request when incoming request exists', async () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest
				.mockResolvedValueOnce(null) // outgoing
				.mockResolvedValueOnce({ id: 20 }); // incoming

			commandsRepository.acceptFriendRequest.mockResolvedValue({
				ok: true,
				data: { id: 30 },
			});

			await expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).resolves.toEqual({ id: 30 });
		});

		it('Should create friend request when no errors occur', async () => {
			queriesRepository.findBlockedRelationship.mockResolvedValue(null);
			queriesRepository.findFriendshipBetweenUsers.mockResolvedValue(null);
			queriesRepository.findFriendRequest
				.mockResolvedValueOnce(null) // outgoing
				.mockResolvedValueOnce(null); // incoming

			commandsRepository.createFriendRequest.mockResolvedValue({
				ok: true,
				data: { id: 40 },
			});

			await expect(
				sendFriendRequest({ requesterId: 1, addresseeId: 2 }),
			).resolves.toEqual({ id: 40 });
		});
	});
});
