/* eslint-disable @typescript-eslint/no-explicit-any */
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

type MockConfigItem<T> = {
  name: string; // nome do mock no objeto final
  factory: () => T; // função que cria o mock
};

type SutConfig = MockConfigItem<any>[];

function makeSutGeneric<TFactoryArgs, TResult, TDeps extends Record<string, any>>(
  factory: (args: TFactoryArgs) => TResult,
  config: SutConfig = []
) {
  const mocks: Partial<TDeps> = {};

  for (const item of config) {
    mocks[item.name as keyof TDeps] = item.factory();
  }

  const sut = factory(mocks as TFactoryArgs);

  return { sut, mocks: mocks as TDeps };
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
type SutBooleanConfig = {
	includeCommands?: boolean;
	includePoems?: boolean;
	includeUsers?: boolean;
	includeFriends?: boolean;
	includeQueries?: boolean;
};
type SutFromFactory<T extends (...args: any) => any> = ReturnType<T>;
type FactoryDeps<T extends (...args: any) => any> = Parameters<T>[0];

export function makeSutWithConfig<TFactory extends (...args: any) => any>(
	factory: TFactory,
	config: SutBooleanConfig = {}
): { sut: SutFromFactory<TFactory>; mocks: SutMocks } {
	const mocks: Partial<SutMocks> = {};

	if (config.includeCommands ?? true) 
		mocks.commandsRepository = Object.assign(createMockedContract<CommandsRepository>(), {
			createPoemComment: mock(),
		});
	
	if (config.includePoems ?? true) 
		mocks.poemsContract = Object.assign(createMockedContract<PoemsContractForInteractions>(), {
			getPoemInteractionInfo: mock(),
		});

	if (config.includeUsers ?? true) 
		mocks.usersContract = Object.assign(createMockedContract<UsersContractForInteractions>(), {
			getUserBasicInfo: mock(),
		});
	
	if (config.includeFriends ?? true) 
		mocks.friendsContract = Object.assign(createMockedContract<FriendsContractForInteractions>(), {
			areBlocked: mock(),
			areFriends: mock(),
		});

	if (config.includeQueries ?? true) 
		mocks.queriesRepository = createMockedContract<QueriesRepository>();

	const factoryArray = Object.entries(mocks).map(([key, value]) => ({
		name: key,
		factory: () => value,
	}));

	const { sut } = makeSutGeneric<FactoryDeps<TFactory>, SutFromFactory<TFactory>, SutMocks>(
		factory,
		factoryArray as any
	);

	return { sut, mocks: mocks as SutMocks };
}

export function makeCreateCommentScenario() {
	const { sut: commentPoem, mocks } = makeSutWithConfig(commentPoemFactory, {
		includeCommands: true,
		includePoems: true,
		includeUsers: true,
		includeFriends: true,
	});

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},
		withPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPoem(mocks.poemsContract, overrides);
			return this;
		},
		withUsersBlocked() {
			givenUsersAreBlocked(mocks.friendsContract);
			return this;
		},
		withUsersFriends() {
			givenUsersAreFriends(mocks.friendsContract);
			return this;
		},
		withCreatedComment(overrides: CreatePoemCommentOverride = {}) {
			givenCreatedComment(mocks.commandsRepository, overrides);
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
