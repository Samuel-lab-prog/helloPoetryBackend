/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from 'bun:test';
import type {
	UsersContractForInteractions,
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../ports/ExternalServices';
import type { CommandsRepository } from '../ports/Commands';
import type { QueriesRepository } from '../ports/Queries';
import {
	createMockedContract,
	type MockedContract,
	makeSutGeneric,
} from '@TestUtils';

export const DEFAULT_PERFORMER_USER_ID = 1;
export const DEFAULT_POEM_OWNER_USER_ID = 2;
export const DEFAULT_POEM_VISIBILITY = 'public';
export const DEFAULT_POEM_MODERATION_STATUS = 'approved';
export const DEFAULT_POEM_STATUS = 'published';
export const DEFAULT_USER_STATUS = 'active';
export const DEFAULT_USER_ROLE = 'author';
export const DEFAULT_POEM_ID = 1;
export const DEFAULT_COMMENT_ID = 1;
export const DEFAULT_COMMENT_CONTENT = 'hello';

export type InteractionsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	poemsContract: MockedContract<PoemsContractForInteractions>;
	usersContract: MockedContract<UsersContractForInteractions>;
	friendsContract: MockedContract<FriendsContractForInteractions>;
};

export type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersContractForInteractions['getUserBasicInfo']>>
>;

export type PoemInteractionInfoOverride = Partial<
	Awaited<ReturnType<PoemsContractForInteractions['getPoemInteractionInfo']>>
>;

export type CreatePoemCommentOverride = Partial<
	Awaited<ReturnType<CommandsRepository['createPoemComment']>>
>;

export type UsersRelationInfoOverride = Partial<
	Awaited<ReturnType<FriendsContractForInteractions['usersRelation']>>
>;

export type SelectCommentByIdOverride = Partial<
	Awaited<ReturnType<QueriesRepository['selectCommentById']>>
>;

export function givenUser(
	userContract: InteractionsSutMocks['usersContract'],
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

export function givenPoem(
	poemsContract: InteractionsSutMocks['poemsContract'],
	overrides: PoemInteractionInfoOverride = {},
) {
	poemsContract.getPoemInteractionInfo.mockResolvedValue({
		exists: true,
		id: DEFAULT_POEM_ID,
		visibility: DEFAULT_POEM_VISIBILITY,
		authorId: DEFAULT_POEM_OWNER_USER_ID,
		status: DEFAULT_POEM_STATUS,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		deletedAt: null,
		isCommentable: true,
		...overrides,
	});
}

export function givenCreatedComment(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
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

export function givenDeletedComment(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	commandsRepository.deletePoemComment.mockResolvedValue(undefined);
}

export function givenFoundComment(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	overrides: Partial<
		Awaited<ReturnType<QueriesRepository['selectCommentById']>>
	> = {},
) {
	queriesRepository.selectCommentById.mockResolvedValue({
		id: DEFAULT_COMMENT_ID,
		userId: DEFAULT_PERFORMER_USER_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
		createdAt: new Date(),
		...overrides,
	});
}

export function givenUsersRelation(
	friendsContract: InteractionsSutMocks['friendsContract'],
	overrides: UsersRelationInfoOverride = {},
) {
	friendsContract.usersRelation.mockResolvedValue({
		areBlocked: false,
		areFriends: false,
		...overrides,
	});
}

type InteractionsSutBooleanConfig = {
	includeCommands?: boolean;
	includePoems?: boolean;
	includeUsers?: boolean;
	includeFriends?: boolean;
	includeQueries?: boolean;
};
type SutFromFactory<T extends (...args: any) => any> = ReturnType<T>;
type FactoryDeps<T extends (...args: any) => any> = Parameters<T>[0];

export function makeInteractionsSutWithConfig<
	TFactory extends (...args: any) => any,
>(
	factory: TFactory,
	config: InteractionsSutBooleanConfig = {},
): { sut: SutFromFactory<TFactory>; mocks: InteractionsSutMocks } {
	const mocks: Partial<InteractionsSutMocks> = {};

	if (config.includeCommands !== false)
		mocks.commandsRepository = Object.assign(
			createMockedContract<CommandsRepository>(),
			{ createPoemComment: mock(), deletePoemComment: mock() },
		);

	if (config.includePoems !== false)
		mocks.poemsContract = Object.assign(
			createMockedContract<PoemsContractForInteractions>(),
			{ getPoemInteractionInfo: mock() },
		);

	if (config.includeUsers !== false)
		mocks.usersContract = Object.assign(
			createMockedContract<UsersContractForInteractions>(),
			{ getUserBasicInfo: mock() },
		);

	if (config.includeFriends !== false)
		mocks.friendsContract = Object.assign(
			createMockedContract<FriendsContractForInteractions>(),
			{ usersRelation: mock() },
		);

	if (config.includeQueries !== false)
		mocks.queriesRepository = Object.assign(
			createMockedContract<QueriesRepository>(),
			{
				selectCommentById: mock(),
				findCommentsByPoemId: mock(),
				existsPoemLike: mock(),
			},
		);

	const factoryArray = Object.entries(mocks).map(([key, value]) => ({
		name: key,
		factory: () => value,
	}));

	const { sut } = makeSutGeneric<
		FactoryDeps<TFactory>,
		SutFromFactory<TFactory>,
		InteractionsSutMocks
	>(factory, factoryArray);

	return { sut, mocks: mocks as InteractionsSutMocks };
}
