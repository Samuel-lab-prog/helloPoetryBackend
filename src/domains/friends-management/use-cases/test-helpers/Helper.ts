import { mock } from 'bun:test';
import type {
	AcceptFriendRequestParams,
	BlockUserParams,
	CancelFriendRequestParams,
	CommandsRepository,
	DeleteFriendParams,
	RejectFriendRequestParams,
	SendFriendRequestParams,
	UnblockUserParams,
} from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import {
	createMockedContract,
	makeParams,
	makeSut,
	type MockedContract,
} from '@TestUtils';
import {
	acceptFriendRequestFactory,
	blockUserFactory,
	cancelFriendRequestFactory,
	deleteFriendFactory,
	rejectFriendRequestFactory,
	sendFriendRequestFactory,
	unblockUserFactory,
} from '../commands/Index';
import {
	DEFAULT_ADDRESSEE_ID,
	DEFAULT_REQUESTER_ID,
} from './Constants';
import {
	givenAcceptedFriendRequest,
	givenBlockedRelationship,
	givenBlockedUser,
	givenCancelledFriendRequest,
	givenCreatedFriendRequest,
	givenDeletedFriend,
	givenFriendRequest,
	givenFriendRequestDeletion,
	givenFriendRequestLookupSequence,
	givenFriendship,
	givenNoBlockedRelationship,
	givenNoFriendRequest,
	givenNoFriendship,
	givenRejectedFriendRequest,
	givenUnblockedUser,
	type BlockedUserRecordOverride,
	type CancelFriendRequestRecordOverride,
	type FriendRequestRecordOverride,
	type FriendRequestRejectionRecordOverride,
	type FriendshipRecordOverride,
	type RemovedFriendRecordOverride,
	type UnblockUserRecordOverride,
} from './Givens';

const friendsManagementMockFactories = {
	commandsRepository: createMockedContract<CommandsRepository>({
		createFriendRequest: mock(),
		rejectFriendRequest: mock(),
		acceptFriendRequest: mock(),
		cancelFriendRequest: mock(),
		blockUser: mock(),
		unblockUser: mock(),
		deleteFriend: mock(),
		deleteFriendRequestIfExists: mock(),
	}),
	queriesRepository: createMockedContract<QueriesRepository>({
		findFriendshipBetweenUsers: mock(),
		findFriendRequest: mock(),
		findBlockedRelationship: mock(),
	}),
};

export type FriendsManagementSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
};

function friendsManagementFactory(deps: typeof friendsManagementMockFactories) {
	return {
		sendFriendRequest: sendFriendRequestFactory(deps),
		acceptFriendRequest: acceptFriendRequestFactory(deps),
		rejectFriendRequest: rejectFriendRequestFactory(deps),
		cancelFriendRequest: cancelFriendRequestFactory(deps),
		blockUser: blockUserFactory(deps),
		deleteFriend: deleteFriendFactory(deps),
		unblockUser: unblockUserFactory(deps),
	};
}

export const makeFriendsManagementScenario = (() => {
	const { sut: sutFactory, mocks } = makeSut(
		friendsManagementFactory,
		friendsManagementMockFactories,
	);

	return {
		withFriendship(overrides: FriendshipRecordOverride = {}) {
			givenFriendship(mocks.queriesRepository, overrides);
			return this;
		},

		withNoFriendship() {
			givenNoFriendship(mocks.queriesRepository);
			return this;
		},

		withBlockedRelationship(overrides: BlockedUserRecordOverride = {}) {
			givenBlockedRelationship(mocks.queriesRepository, overrides);
			return this;
		},

		withNoBlockedRelationship() {
			givenNoBlockedRelationship(mocks.queriesRepository);
			return this;
		},

		withFriendRequest(overrides: FriendRequestRecordOverride = {}) {
			givenFriendRequest(mocks.queriesRepository, overrides);
			return this;
		},

		withNoFriendRequest() {
			givenNoFriendRequest(mocks.queriesRepository);
			return this;
		},

		withFriendRequestLookupSequence(
			lookups: [
				FriendRequestRecordOverride | null,
				FriendRequestRecordOverride | null,
			],
		) {
			givenFriendRequestLookupSequence(mocks.queriesRepository, lookups);
			return this;
		},

		withCreatedFriendRequest(overrides: FriendRequestRecordOverride = {}) {
			givenCreatedFriendRequest(mocks.commandsRepository, overrides);
			return this;
		},

		withAcceptedFriendRequest(overrides: FriendshipRecordOverride = {}) {
			givenAcceptedFriendRequest(mocks.commandsRepository, overrides);
			return this;
		},

		withRejectedFriendRequest(
			overrides: FriendRequestRejectionRecordOverride = {},
		) {
			givenRejectedFriendRequest(mocks.commandsRepository, overrides);
			return this;
		},

		withCancelledFriendRequest(
			overrides: CancelFriendRequestRecordOverride = {},
		) {
			givenCancelledFriendRequest(mocks.commandsRepository, overrides);
			return this;
		},

		withDeletedFriend(overrides: RemovedFriendRecordOverride = {}) {
			givenDeletedFriend(mocks.commandsRepository, overrides);
			return this;
		},

		withFriendRequestDeletion() {
			givenFriendRequestDeletion(mocks.commandsRepository);
			return this;
		},

		withBlockedUser(overrides: BlockedUserRecordOverride = {}) {
			givenBlockedUser(mocks.commandsRepository, overrides);
			return this;
		},

		withUnblockedUser(overrides: UnblockUserRecordOverride = {}) {
			givenUnblockedUser(mocks.commandsRepository, overrides);
			return this;
		},

		executeSendFriendRequest(params: Partial<SendFriendRequestParams> = {}) {
			return sutFactory.sendFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeAcceptFriendRequest(
			params: Partial<AcceptFriendRequestParams> = {},
		) {
			return sutFactory.acceptFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeRejectFriendRequest(
			params: Partial<RejectFriendRequestParams> = {},
		) {
			return sutFactory.rejectFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeCancelFriendRequest(
			params: Partial<CancelFriendRequestParams> = {},
		) {
			return sutFactory.cancelFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeBlockUser(params: Partial<BlockUserParams> = {}) {
			return sutFactory.blockUser(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeDeleteFriend(params: Partial<DeleteFriendParams> = {}) {
			return sutFactory.deleteFriend(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeUnblockUser(params: Partial<UnblockUserParams> = {}) {
			return sutFactory.unblockUser(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		get mocks(): FriendsManagementSutMocks {
			return mocks;
		},
	};
})();
