import { mock } from 'bun:test';
import { commentPoemFactory, type CommentPoemDependencies } from './commands/Index';

import type {
	UsersContractForInteractions,
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../ports/ExternalServices';

import type { CommandsRepository, CommentPoemParams } from '../ports/Commands';
import { createMockedContract, type MockedContract } from '@TestUtils';
import type { QueriesRepository } from '../ports/Queries';
import type { PoemComment } from './Models';

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

type SutOptions = {
	includeCommands?: boolean;
	includeQueries?: boolean;
	includePoems?: boolean;
	includeUsers?: boolean;
	includeFriends?: boolean;
};

// We could make this function even more generic following this idea:
// 1. Aceept an array of objects each one containing:
	//   - the name of the dependency (e.g. 'commandsRepository')
	//   - The type of the dependency (e.g. CommandsRepository)
	// 2. Loop through this array and create the mocks based on the provided info
	// 3. This way we could reuse this function across different use-cases just by providing the right config
function makeSut<TFactoryArgs, TResult>(
	factory: (args: TFactoryArgs) => TResult,
	options: SutOptions = {},
) {
	const mocks: SutMocks = {} as unknown as SutMocks;

	if (options.includeCommands) {
		const commandsRepository = createMockedContract<CommandsRepository>();
		commandsRepository.createPoemComment = mock();
		mocks.commandsRepository = commandsRepository;
	}

	if (options.includePoems) {
		const poemsContract = createMockedContract<PoemsContractForInteractions>();
		poemsContract.getPoemInteractionInfo = mock();
		mocks.poemsContract = poemsContract;
	}

	if (options.includeUsers) {
		const usersContract = createMockedContract<UsersContractForInteractions>();
		usersContract.getUserBasicInfo = mock();
		mocks.usersContract = usersContract;
	}

	if (options.includeFriends) {
		const friendsContract =
			createMockedContract<FriendsContractForInteractions>();
		friendsContract.areBlocked = mock();
		friendsContract.areFriends = mock();
		mocks.friendsContract = friendsContract;
	}

	const sut = factory(mocks as unknown as TFactoryArgs);

	return { sut, mocks };
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

function givenUser(
	userContract: SutMocks['usersContract'],
	overrides: UserBasicInfoOverride = {},
) {
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
	const { sut: commentPoem, mocks } = makeSut<CommentPoemDependencies, (params: CommentPoemParams) => Promise<PoemComment>>(commentPoemFactory, {
		includeCommands: true,
		includePoems: true,
		includeUsers: true,
		includeFriends: true,
	});
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
