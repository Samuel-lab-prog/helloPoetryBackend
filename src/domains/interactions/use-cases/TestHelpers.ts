import { mock } from 'bun:test';
import { commentPoemFactory } from './commands/Index';

import type {
	UsersContractForInteractions,
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../ports/ExternalServices';

import type { CommandsRepository, CommentPoemParams } from '../ports/Commands';
import { createMockedContract, type MockedContract } from '@TestUtils';
import type { QueriesRepository } from '../ports/Queries';

type SutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
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

function givenUser(userContract: SutMocks['usersContract'], overrides: UserBasicInfoOverride = {}) {
	userContract.getUserBasicInfo.mockResolvedValue({
		exists: true,
		status: DEFAULT_USER_STATUS,
		id: DEFAULT_PERFORMER_USER_ID,
		role: DEFAULT_USER_ROLE,
		...overrides,
	});
}

function givenPoem(
	poemsContract: SutMocks['poemsContract'],
	overrides: PoemInteractionInfoOverride = {},
) {
	poemsContract.getPoemInteractionInfo.mockResolvedValue({
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
	commandsRepository: SutMocks['commandsRepository'],
	overrides: CreatePoemCommentOverride = {},
) {
	commandsRepository.createPoemComment.mockResolvedValue({
		id: DEFAULT_COMMENT_ID,
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
		createdAt: new Date(),
		...overrides,
	});
}

function givenUsersAreBlocked(friendsContract: SutMocks['friendsContract']) {
	friendsContract.areBlocked.mockResolvedValue(true);
}

function givenUsersAreFriends(friendsContract: SutMocks['friendsContract']) {
	friendsContract.areFriends.mockResolvedValue(true);
}

export function makeCreateCommentScenario() {
	const { commentPoem, mocks } = makeCreateCommentSut();

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks['usersContract'], overrides);
			return this;
		},

		withPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPoem(mocks['poemsContract'], overrides);
			return this;
		},

		withUsersBlocked() {
			givenUsersAreBlocked(mocks['friendsContract']);
			return this;
		},

		withUsersFriends() {
			givenUsersAreFriends(mocks['friendsContract']);
			return this;
		},

		withCreatedComment(overrides: CreatePoemCommentOverride = {}) {
			givenCreatedComment(mocks['commandsRepository'], overrides);
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
