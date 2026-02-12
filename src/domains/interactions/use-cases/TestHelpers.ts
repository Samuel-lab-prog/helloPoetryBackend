import { mock } from 'bun:test';
import { commentPoemFactory } from './commands/Index';

import type {
	UsersContractForInteractions,
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../ports/ExternalServices';

import type { CommandsRepository, CommentPoemParams } from '../ports/Commands';
import { createMockedContract, type MockedContract } from 'tests/TestsUtils';

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

function givenActiveUser(mocks: SutMocks) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: 'active',
		id: 1,
		role: 'author',
	});
}

function givenSuspendedUser(mocks: SutMocks) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: 'suspended',
		id: 1,
		role: 'author',
	});
}

function givenUserDoesNotExist(mocks: SutMocks) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: false,
		status: 'active',
		id: 0,
		role: 'author',
	});
}

function givenPublicApprovedPoem(mocks: SutMocks) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'public',
		authorId: 2,
		moderationStatus: 'approved',
		deletedAt: null,
	});
}

function givenPrivatePoem(mocks: SutMocks) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'private',
		authorId: 2,
		moderationStatus: 'approved',
		deletedAt: null,
	});
}

function givenFriendsOnlyPoem(mocks: SutMocks) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'friends',
		authorId: 2,
		moderationStatus: 'approved',
		deletedAt: null,
	});
}

function givenPoemDoesNotExist(mocks: SutMocks) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: false,
		visibility: null,
		authorId: 0,
		moderationStatus: null,
		deletedAt: null,
	});
}

function givenPoemNotApproved(mocks: SutMocks) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: 'public',
		authorId: 2,
		moderationStatus: 'pending',
		deletedAt: null,
	});
}

function givenValidComment(mocks: SutMocks) {
	mocks.commandsRepository.createPoemComment.mockResolvedValue({
		id: 1,
		userId: 1,
		poemId: 10,
		content: 'hello',
		createdAt: new Date(),
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
		withActiveUser() {
			givenActiveUser(mocks);
			return this;
		},

		withSuspendedUser() {
			givenSuspendedUser(mocks);
			return this;
		},

		withUnknownUser() {
			givenUserDoesNotExist(mocks);
			return this;
		},

		withPublicPoem() {
			givenPublicApprovedPoem(mocks);
			return this;
		},

		withPrivatePoem() {
			givenPrivatePoem(mocks);
			return this;
		},

		withUnknownPoem() {
			givenPoemDoesNotExist(mocks);
			return this;
		},

		withFriendsOnlyPoem() {
			givenFriendsOnlyPoem(mocks);
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

		withPoemNotApproved() {
			givenPoemNotApproved(mocks);
			return this;
		},

		withValidComment() {
			givenValidComment(mocks);
			return this;
		},

		withValidScenario() {
			return this.withActiveUser().withPublicPoem();
		},

		execute(params = makeParams()) {
			return suts.commentPoem(params);
		},

		get mocks() {
			return mocks;
		},
	};
}
