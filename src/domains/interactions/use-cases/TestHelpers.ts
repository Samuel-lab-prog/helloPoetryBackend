/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { mock } from 'bun:test';
import { commentPoemFactory } from './commands/Index';

import type {
	UsersContractForInteractions,
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../ports/ExternalServices';

import type { CommandsRepository, CommentPoemParams } from '../ports/Commands';
import { createMockedContract, type MockedContract } from '@TestUtils';

type SutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	poemsContract: MockedContract<PoemsContractForInteractions>;
	usersContract: MockedContract<UsersContractForInteractions>;
	friendsContract: MockedContract<FriendsContractForInteractions>;
};

function makeSuts() {
	const commandsRepository = createMockedContract<CommandsRepository>();
	const poemsContract = createMockedContract<PoemsContractForInteractions>();
	const usersContract = createMockedContract<UsersContractForInteractions>();
	const friendsContract =
		createMockedContract<FriendsContractForInteractions>();

	commandsRepository.createPoemComment =
		mock<CommandsRepository['createPoemComment']>();

	poemsContract.getPoemInteractionInfo =
		mock<PoemsContractForInteractions['getPoemInteractionInfo']>();

	usersContract.getUserBasicInfo =
		mock<UsersContractForInteractions['getUserBasicInfo']>();

	friendsContract.areBlocked =
		mock<FriendsContractForInteractions['areBlocked']>();

	friendsContract.areFriends =
		mock<FriendsContractForInteractions['areFriends']>();

	usersContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: 'active',
		id: 1,
		role: 'author',
	});

	poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'public',
		authorId: 2,
		moderationStatus: 'approved',
		deletedAt: null,
	});

	friendsContract.areBlocked.mockResolvedValue(false);
	friendsContract.areFriends.mockResolvedValue(false);

	const commentPoem = commentPoemFactory({
		commandsRepository,
		poemsContract,
		usersContract,
		friendsContract,
	});

	return {
		suts: {
			commentPoem,
		},
		mocks: {
			commandsRepository,
			poemsContract,
			usersContract,
			friendsContract,
		},
	};
}

export function makeParams(
	overrides: Partial<CommentPoemParams> = {},
): CommentPoemParams {
	return {
		userId: 1,
		poemId: 10,
		content: 'hello',
		...overrides,
	};
}

type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersContractForInteractions['getUserBasicInfo']>>
>;

type PoemInteractionInfoOverride = Partial<
	Awaited<ReturnType<PoemsContractForInteractions['getPoemInteractionInfo']>>
>;

type CreatePoemCommentOverride = Partial<
	Awaited<ReturnType<CommandsRepository['createPoemComment']>>
>;

const PERFORMER_USER_ID = 1;
const OWNER_USER_ID = 2;

function givenActiveUser(
	mocks: SutMocks,
	overrides: UserBasicInfoOverride = {},
) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: 'active',
		id: PERFORMER_USER_ID,
		role: 'author',
		...overrides,
	});
}

function givenSuspendedUser(
	mocks: SutMocks,
	overrides: UserBasicInfoOverride = {},
) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: 'suspended',
		id: PERFORMER_USER_ID,
		role: 'author',
		...overrides,
	});
}

function givenBannedUser(
	mocks: SutMocks,
	overrides: UserBasicInfoOverride = {},
) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: 'banned',
		id: PERFORMER_USER_ID,
		role: 'author',
		...overrides,
	});
}

function givenUnknownUser(
	mocks: SutMocks,
	overrides: UserBasicInfoOverride = {},
) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: false,
		status: 'active',
		id: 0,
		role: 'author',
		...overrides,
	});
}

function givenOwnerPoem(
	mocks: SutMocks,
	overrides: PoemInteractionInfoOverride = {},
) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'public',
		authorId: PERFORMER_USER_ID,
		moderationStatus: 'approved',
		deletedAt: null,
		...overrides,
	});
}

function givenPublicApprovedPoem(
	mocks: SutMocks,
	overrides: PoemInteractionInfoOverride = {},
) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'public',
		authorId: OWNER_USER_ID,
		moderationStatus: 'approved',
		deletedAt: null,
		...overrides,
	});
}

function givenPrivatePoem(
	mocks: SutMocks,
	overrides: PoemInteractionInfoOverride = {},
) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'private',
		authorId: OWNER_USER_ID,
		moderationStatus: 'approved',
		deletedAt: null,
		...overrides,
	});
}

function givenFriendsOnlyPoem(
	mocks: SutMocks,
	overrides: PoemInteractionInfoOverride = {},
) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'friends',
		authorId: OWNER_USER_ID,
		moderationStatus: 'approved',
		deletedAt: null,
		...overrides,
	});
}

function givenPoemDoesNotExist(
	mocks: SutMocks,
	overrides: PoemInteractionInfoOverride = {},
) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: false,
		visibility: null,
		authorId: 0,
		moderationStatus: null,
		deletedAt: null,
		...overrides,
	});
}

function givenPoemNotApproved(
	mocks: SutMocks,
	overrides: PoemInteractionInfoOverride = {},
) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'public',
		authorId: OWNER_USER_ID,
		moderationStatus: 'pending',
		deletedAt: null,
		...overrides,
	});
}

function givenValidComment(
	mocks: SutMocks,
	overrides: CreatePoemCommentOverride = {},
) {
	mocks.commandsRepository.createPoemComment.mockResolvedValue({
		id: 1,
		userId: PERFORMER_USER_ID,
		poemId: 10,
		content: 'hello',
		createdAt: new Date(),
		...overrides,
	});
}

function givenUsersAreBlocked(mocks: SutMocks) {
	mocks.friendsContract.areBlocked.mockResolvedValue(true);
}

function givenUsersAreFriends(mocks: SutMocks) {
	mocks.friendsContract.areFriends.mockResolvedValue(true);
}

export function makeCommentScenario() {
	const { suts, mocks } = makeSuts();

	return {
		withActiveUser(overrides: UserBasicInfoOverride = {}) {
			givenActiveUser(mocks, overrides);
			return this;
		},

		withSuspendedUser(overrides: UserBasicInfoOverride = {}) {
			givenSuspendedUser(mocks, overrides);
			return this;
		},

		withUnknownUser(overrides: UserBasicInfoOverride = {}) {
			givenUnknownUser(mocks, overrides);
			return this;
		},

		withBannedUser(overrides: UserBasicInfoOverride = {}) {
			givenBannedUser(mocks, overrides);
			return this;
		},

		withPublicPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPublicApprovedPoem(mocks, overrides);
			return this;
		},

		withPrivatePoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPrivatePoem(mocks, overrides);
			return this;
		},

		withUnknownPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPoemDoesNotExist(mocks, overrides);
			return this;
		},

		withFriendsOnlyPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenFriendsOnlyPoem(mocks, overrides);
			return this;
		},

		withOwnerPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenOwnerPoem(mocks, overrides);
			return this;
		},

		withPoemNotApproved(overrides: PoemInteractionInfoOverride = {}) {
			givenPoemNotApproved(mocks, overrides);
			return this;
		},

		withUsersBlocked() {
			givenUsersAreBlocked(mocks);
			return this;
		},

		withUsersFriends() {
			givenUsersAreFriends(mocks);
			return this;
		},

		withValidComment(overrides: CreatePoemCommentOverride = {}) {
			givenValidComment(mocks, overrides);
			return this;
		},

		withValidScenario() {
			return this.withActiveUser().withPublicPoem()
		},

		execute(params = makeParams()) {
			return suts.commentPoem(params);
		},

		get mocks() {
			return mocks;
		},
	};
}
