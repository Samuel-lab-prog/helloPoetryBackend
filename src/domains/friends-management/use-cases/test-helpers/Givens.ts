import { givenResolved } from '@TestUtils';
import type {
	BlockedUserRecord,
	CancelFriendRequestRecord,
	FriendRequestRecord,
	FriendRequestRejectionRecord,
	FriendshipRecord,
	RemovedFriendRecord,
	UnblockUserRecord,
} from '../Models';
import type { FriendsManagementSutMocks } from './SutMocks';
import {
	DEFAULT_ADDRESSEE_ID,
	DEFAULT_RECORD_ID,
	DEFAULT_REQUESTER_ID,
} from './Constants';

export type FriendRequestRecordOverride = Partial<FriendRequestRecord>;
export type FriendshipRecordOverride = Partial<FriendshipRecord>;
export type BlockedUserRecordOverride = Partial<BlockedUserRecord>;
export type CancelFriendRequestRecordOverride = Partial<CancelFriendRequestRecord>;
export type FriendRequestRejectionRecordOverride =
	Partial<FriendRequestRejectionRecord>;
export type UnblockUserRecordOverride = Partial<UnblockUserRecord>;
export type RemovedFriendRecordOverride = Partial<RemovedFriendRecord>;

function makeFriendRequestRecord(
	overrides: FriendRequestRecordOverride = {},
): FriendRequestRecord {
	return {
		id: DEFAULT_RECORD_ID,
		requesterId: DEFAULT_REQUESTER_ID,
		addresseeId: DEFAULT_ADDRESSEE_ID,
		createdAt: new Date(),
		...overrides,
	};
}

function resetMock(mockedFn: { mockReset: () => void }) {
	mockedFn.mockReset();
}

export function givenFriendship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	overrides: FriendshipRecordOverride = {},
) {
	resetMock(queriesRepository.findFriendshipBetweenUsers);
	givenResolved(queriesRepository, 'findFriendshipBetweenUsers', {
		id: DEFAULT_RECORD_ID,
		userAId: DEFAULT_REQUESTER_ID,
		userBId: DEFAULT_ADDRESSEE_ID,
		createdAt: new Date(),
		...overrides,
	});
}

export function givenNoFriendship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
) {
	resetMock(queriesRepository.findFriendshipBetweenUsers);
	givenResolved(queriesRepository, 'findFriendshipBetweenUsers', null);
}

export function givenBlockedRelationship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	overrides: BlockedUserRecordOverride = {},
) {
	resetMock(queriesRepository.findBlockedRelationship);
	givenResolved(queriesRepository, 'findBlockedRelationship', {
		id: DEFAULT_RECORD_ID,
		blockedById: DEFAULT_REQUESTER_ID,
		blockedUserId: DEFAULT_ADDRESSEE_ID,
		createdAt: new Date(),
		...overrides,
	});
}

export function givenNoBlockedRelationship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
) {
	resetMock(queriesRepository.findBlockedRelationship);
	givenResolved(queriesRepository, 'findBlockedRelationship', null);
}

export function givenFriendRequest(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	overrides: FriendRequestRecordOverride = {},
) {
	resetMock(queriesRepository.findFriendRequest);
	givenResolved(
		queriesRepository,
		'findFriendRequest',
		makeFriendRequestRecord(overrides),
	);
}

export function givenNoFriendRequest(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
) {
	resetMock(queriesRepository.findFriendRequest);
	givenResolved(queriesRepository, 'findFriendRequest', null);
}

export function givenFriendRequestLookupSequence(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	lookups: [FriendRequestRecordOverride | null, FriendRequestRecordOverride | null],
) {
	const [outgoing, incoming] = lookups;
	resetMock(queriesRepository.findFriendRequest);
	queriesRepository.findFriendRequest.mockResolvedValueOnce(
		outgoing ? makeFriendRequestRecord(outgoing) : null,
	);
	queriesRepository.findFriendRequest.mockResolvedValueOnce(
		incoming ? makeFriendRequestRecord(incoming) : null,
	);
}

export function givenCreatedFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
	overrides: FriendRequestRecordOverride = {},
) {
	resetMock(commandsRepository.createFriendRequest);
	givenResolved(commandsRepository, 'createFriendRequest', {
		ok: true,
		data: makeFriendRequestRecord(overrides),
	});
}

export function givenAcceptedFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
	overrides: FriendshipRecordOverride = {},
) {
	resetMock(commandsRepository.acceptFriendRequest);
	givenResolved(commandsRepository, 'acceptFriendRequest', {
		ok: true,
		data: {
			id: DEFAULT_RECORD_ID,
			userAId: DEFAULT_REQUESTER_ID,
			userBId: DEFAULT_ADDRESSEE_ID,
			createdAt: new Date(),
			...overrides,
		},
	});
}

export function givenRejectedFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
	overrides: FriendRequestRejectionRecordOverride = {},
) {
	resetMock(commandsRepository.rejectFriendRequest);
	givenResolved(commandsRepository, 'rejectFriendRequest', {
		ok: true,
		data: {
			rejecterId: DEFAULT_REQUESTER_ID,
			rejectedId: DEFAULT_ADDRESSEE_ID,
			...overrides,
		},
	});
}

export function givenCancelledFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
	overrides: CancelFriendRequestRecordOverride = {},
) {
	resetMock(commandsRepository.cancelFriendRequest);
	givenResolved(commandsRepository, 'cancelFriendRequest', {
		ok: true,
		data: {
			cancellerId: DEFAULT_REQUESTER_ID,
			cancelledId: DEFAULT_ADDRESSEE_ID,
			...overrides,
		},
	});
}

export function givenDeletedFriend(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
	overrides: RemovedFriendRecordOverride = {},
) {
	resetMock(commandsRepository.deleteFriend);
	givenResolved(commandsRepository, 'deleteFriend', {
		ok: true,
		data: {
			removedById: DEFAULT_REQUESTER_ID,
			removedId: DEFAULT_ADDRESSEE_ID,
			...overrides,
		},
	});
}

export function givenFriendRequestDeletion(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	resetMock(commandsRepository.deleteFriendRequestIfExists);
	givenResolved(commandsRepository, 'deleteFriendRequestIfExists', {
		ok: true,
		data: undefined,
	});
}

export function givenBlockedUser(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
	overrides: BlockedUserRecordOverride = {},
) {
	resetMock(commandsRepository.blockUser);
	givenResolved(commandsRepository, 'blockUser', {
		ok: true,
		data: {
			id: DEFAULT_RECORD_ID,
			blockedById: DEFAULT_REQUESTER_ID,
			blockedUserId: DEFAULT_ADDRESSEE_ID,
			createdAt: new Date(),
			...overrides,
		},
	});
}

export function givenUnblockedUser(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
	overrides: UnblockUserRecordOverride = {},
) {
	resetMock(commandsRepository.unblockUser);
	givenResolved(commandsRepository, 'unblockUser', {
		ok: true,
		data: {
			unblockerId: DEFAULT_REQUESTER_ID,
			unblockedId: DEFAULT_ADDRESSEE_ID,
			...overrides,
		},
	});
}
