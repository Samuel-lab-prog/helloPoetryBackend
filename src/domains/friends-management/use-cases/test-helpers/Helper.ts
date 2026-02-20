/* eslint-disable max-lines-per-function */
import type {
	AcceptFriendRequestParams,
	BlockUserParams,
	CancelFriendRequestParams,
	DeleteFriendParams,
	RejectFriendRequestParams,
	SendFriendRequestParams,
	UnblockUserParams,
} from '../../ports/Commands';
import { makeParams, makeSut } from '@TestUtils';
import {
	givenAddressee,
	givenNoFriendship,
	givenFriendship,
	givenNoBlockedRelationship,
	givenBlockedRelationship,
	givenNoFriendRequest,
	givenFriendRequest,
	givenFriendRequestLookup,
	givenCreatedFriendRequest,
	givenAcceptedFriendRequest,
	givenRejectedFriendRequest,
	givenCancelledFriendRequest,
	givenDeletedFriend,
	givenBlockedUser,
	givenUnblockedUser,
	givenDeletedFriendRequestIfExists,
	type UserBasicInfoOverride,
	type FriendRequestOverride,
	type FriendshipOverride,
	type BlockedRelationshipOverride,
} from './Givens';
import {
	type FriendsManagementSutMocks,
	friendsManagementFactory,
	friendsManagementMockFactories,
} from './SutMocks';
import { DEFAULT_REQUESTER_ID, DEFAULT_ADDRESSEE_ID } from './Constants';

export function makeFriendsManagementScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		friendsManagementFactory,
		friendsManagementMockFactories(),
	);

	return {
		withAddressee(overrides: UserBasicInfoOverride = {}) {
			givenAddressee(mocks.usersContract, overrides);
			return this;
		},

		withNoFriendship() {
			givenNoFriendship(mocks.queriesRepository);
			return this;
		},

		withFriendship(overrides: FriendshipOverride = {}) {
			givenFriendship(mocks.queriesRepository, overrides);
			return this;
		},

		withNoBlockedRelationship() {
			givenNoBlockedRelationship(mocks.queriesRepository);
			return this;
		},

		withBlockedRelationship(overrides: BlockedRelationshipOverride = {}) {
			givenBlockedRelationship(mocks.queriesRepository, overrides);
			return this;
		},

		withNoFriendRequest() {
			givenNoFriendRequest(mocks.queriesRepository);
			return this;
		},

		withFriendRequest(overrides: FriendRequestOverride = {}) {
			givenFriendRequest(mocks.queriesRepository, overrides);
			return this;
		},

		withFriendRequestLookup(options: {
			outgoing: FriendRequestOverride | null;
			incoming: FriendRequestOverride | null;
		}) {
			givenFriendRequestLookup(mocks.queriesRepository, options);
			return this;
		},

		withCreatedFriendRequest() {
			givenCreatedFriendRequest(mocks.commandsRepository);
			return this;
		},

		withAcceptedFriendRequest() {
			givenAcceptedFriendRequest(mocks.commandsRepository);
			return this;
		},

		withRejectedFriendRequest() {
			givenRejectedFriendRequest(mocks.commandsRepository);
			return this;
		},

		withCancelledFriendRequest() {
			givenCancelledFriendRequest(mocks.commandsRepository);
			return this;
		},

		withDeletedFriend() {
			givenDeletedFriend(mocks.commandsRepository);
			return this;
		},

		withBlockedUser() {
			givenBlockedUser(mocks.commandsRepository);
			return this;
		},

		withUnblockedUser() {
			givenUnblockedUser(mocks.commandsRepository);
			return this;
		},

		withDeletedFriendRequestIfExists() {
			givenDeletedFriendRequestIfExists(mocks.commandsRepository);
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
}
