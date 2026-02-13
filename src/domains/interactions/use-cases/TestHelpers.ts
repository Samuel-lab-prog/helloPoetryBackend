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

export type UsersRelationInfoOverride = Partial<
	Awaited<ReturnType<FriendsContractForInteractions['usersRelation']>>
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
		isCommentable: true,
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

export const interactionsMockFactories = {
  usersContract: createMockedContract<UsersContractForInteractions>({
    getUserBasicInfo: mock(),
  }),
  poemsContract: createMockedContract<PoemsContractForInteractions>({
    getPoemInteractionInfo: mock(),
  }),
  friendsContract: createMockedContract<FriendsContractForInteractions>({
    usersRelation: mock(),
  }),
  commandsRepository: createMockedContract<CommandsRepository>({
    createPoemComment: mock(),
    deletePoemComment: mock(),
    createPoemLike: mock(),
    deletePoemLike: mock(),
  }),
  queriesRepository: createMockedContract<QueriesRepository>({
    selectCommentById: mock(),
    findCommentsByPoemId: mock(),
    findPoemLike: mock(),
  }),
} as const;

export const interactionsTestModule = {
  makeSut<TFactory extends (deps: typeof interactionsMockFactories) => any>(
    factory: TFactory
  ) {
    const mocks: typeof interactionsMockFactories = { ...interactionsMockFactories };
    const sut = factory(mocks);
    return { sut, mocks };
  },
};
