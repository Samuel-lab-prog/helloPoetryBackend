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

const DEFAULT_PERFORMER_USER_ID = 1;
const DEFAULT_POEM_OWNER_USER_ID = 2;

const DEFAULT_POEM_VISIBILITY = 'public';
const DEFAULT_POEM_MODERATION_STATUS = 'approved';
const DEFAULT_POEM_STATUS = 'published';

const DEFAULT_USER_STATUS = 'active';
const DEFAULT_USER_ROLE = 'author';

const DEFAULT_POEM_ID = 1;
const DEFAULT_COMMENT_ID = 1;

const DEFAULT_COMMENT_CONTENT = 'hello';

function makeCreateCommentSut() {
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
		status: DEFAULT_USER_STATUS,
		id: DEFAULT_PERFORMER_USER_ID,
		role: DEFAULT_USER_ROLE,
	});

	poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: DEFAULT_POEM_VISIBILITY,
		status: DEFAULT_POEM_STATUS,
		authorId: DEFAULT_POEM_OWNER_USER_ID,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
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
		commentPoem,
		mocks: {
			commandsRepository,
			poemsContract,
			usersContract,
			friendsContract,
		},
	};
}

export function makeCreateCommentParams(
	overrides: Partial<CommentPoemParams> = {},
): CommentPoemParams {
	return {
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
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

function givenUser(mocks: SutMocks, overrides: UserBasicInfoOverride = {}) {
	mocks.usersContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: DEFAULT_USER_STATUS,
		id: DEFAULT_PERFORMER_USER_ID,
		role: DEFAULT_USER_ROLE,
		...overrides,
	});
}

function givenPoem(
	mocks: SutMocks,
	overrides: PoemInteractionInfoOverride = {},
) {
	mocks.poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		visibility: DEFAULT_POEM_VISIBILITY,
		authorId: DEFAULT_POEM_OWNER_USER_ID,
		status: DEFAULT_POEM_STATUS,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		deletedAt: null,
		...overrides,
	});
}

function givenCreatedComment(
	mocks: SutMocks,
	overrides: CreatePoemCommentOverride = {},
) {
	mocks.commandsRepository.createPoemComment.mockResolvedValue({
		id: DEFAULT_COMMENT_ID,
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
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

export function makeCreateCommentScenario() {
	const { commentPoem, mocks } = makeCreateCommentSut();

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks, overrides);
			return this;
		},

		withPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPoem(mocks, overrides);
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

		withCreatedComment(overrides: CreatePoemCommentOverride = {}) {
			givenCreatedComment(mocks, overrides);
			return this;
		},

		execute(params = makeCreateCommentParams()) {
			return commentPoem(params);
		},

		get mocks() {
			return mocks;
		},
	};
}
