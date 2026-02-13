/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MockedContract } from '@TestUtils';
import type {
  UsersContractForInteractions,
  FriendsContractForInteractions,
  PoemsContractForInteractions,
} from '../../ports/ExternalServices';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import type { InteractionsSutMocks } from './SutMocks';
import {
  DEFAULT_PERFORMER_USER_ID,
  DEFAULT_USER_ROLE,
  DEFAULT_USER_STATUS,
  DEFAULT_POEM_ID,
  DEFAULT_POEM_OWNER_USER_ID,
  DEFAULT_POEM_VISIBILITY,
  DEFAULT_POEM_MODERATION_STATUS,
  DEFAULT_POEM_STATUS,
  DEFAULT_COMMENT_CONTENT,
  DEFAULT_COMMENT_ID,
} from './Constants';

function givenResolved<T extends Record<string, any>, K extends keyof T>(
  mockedContract: MockedContract<T>,
  key: K,
  value: Awaited<ReturnType<T[K]>>
) {
  (mockedContract[key] as unknown as { mockResolvedValue: (v: any) => void })
    .mockResolvedValue(value);
}

export type UserBasicInfoOverride = Partial<
  Awaited<ReturnType<UsersContractForInteractions['getUserBasicInfo']>>
>;
export type PoemInteractionInfoOverride = Partial<
  Awaited<ReturnType<PoemsContractForInteractions['getPoemInteractionInfo']>>
>;
export type UsersRelationInfoOverride = Partial<
  Awaited<ReturnType<FriendsContractForInteractions['usersRelation']>>
>;
export type DeletePoemLikeOverride = Partial<
  Awaited<ReturnType<CommandsRepository['deletePoemLike']>>
>;
export type CreatePoemLikeOverride = Partial<
  Awaited<ReturnType<CommandsRepository['createPoemLike']>>
>;
export type CreatePoemCommentOverride = Partial<
  Awaited<ReturnType<CommandsRepository['createPoemComment']>>
>;
export type FindCommentsOverride = Partial<
  Awaited<ReturnType<QueriesRepository['findCommentsByPoemId']>>[number]
>;

export function givenUser(
  userContract: InteractionsSutMocks['usersContract'],
  overrides: UserBasicInfoOverride = {},
) {
  givenResolved(userContract, 'getUserBasicInfo', {
    exists: true,
    id: DEFAULT_PERFORMER_USER_ID,
    status: DEFAULT_USER_STATUS,
    role: DEFAULT_USER_ROLE,
    ...overrides,
  });
}

export function givenPoem(
  poemsContract: InteractionsSutMocks['poemsContract'],
  overrides: PoemInteractionInfoOverride = {},
) {
  givenResolved(poemsContract, 'getPoemInteractionInfo', {
    exists: true,
    id: DEFAULT_POEM_ID,
    authorId: DEFAULT_POEM_OWNER_USER_ID,
    visibility: DEFAULT_POEM_VISIBILITY,
    moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
    status: DEFAULT_POEM_STATUS,
    isCommentable: true,
    ...overrides,
  });
}

export function givenUsersRelation(
  friendsContract: InteractionsSutMocks['friendsContract'],
  overrides: UsersRelationInfoOverride = {},
) {
  givenResolved(friendsContract, 'usersRelation', {
    areFriends: false,
    areBlocked: false,
    ...overrides,
  });
}

export function givenPoemLikeDeleted(
  commandsRepository: InteractionsSutMocks['commandsRepository'],
  overrides: DeletePoemLikeOverride = {},
) {
  givenResolved(commandsRepository, 'deletePoemLike', {
    userId: DEFAULT_PERFORMER_USER_ID,
    poemId: DEFAULT_POEM_ID,
    ...overrides,
  });
}

export function givenPoemLikeExists(
  queriesRepository: InteractionsSutMocks['queriesRepository'],
  exists: boolean,
) {
  givenResolved(queriesRepository, 'findPoemLike', 
    exists
      ? { userId: DEFAULT_PERFORMER_USER_ID, poemId: DEFAULT_POEM_ID }
      : null
  );
}

export function givenPoemLikeCreated(
  commandsRepository: InteractionsSutMocks['commandsRepository'],
  overrides: CreatePoemLikeOverride = {},
) {
  givenResolved(commandsRepository, 'createPoemLike', {
    userId: DEFAULT_PERFORMER_USER_ID,
    poemId: DEFAULT_POEM_ID,
    ...overrides,
  });
}

export function givenCreatedComment(
  commandsRepository: InteractionsSutMocks['commandsRepository'],
  overrides: CreatePoemCommentOverride = {},
) {
  givenResolved(commandsRepository, 'createPoemComment', {
    id: DEFAULT_COMMENT_ID,
    userId: DEFAULT_PERFORMER_USER_ID,
    poemId: DEFAULT_POEM_ID,
    content: DEFAULT_COMMENT_CONTENT,
    createdAt: new Date(),
    ...overrides,
  });
}

export function givenExistingComments(
  queriesRepository: InteractionsSutMocks['queriesRepository'],
  overrides: FindCommentsOverride = {},
) {
  givenResolved(queriesRepository, 'findCommentsByPoemId', [
    {
      id: DEFAULT_COMMENT_ID,
      userId: DEFAULT_PERFORMER_USER_ID,
      poemId: DEFAULT_POEM_ID,
      content: DEFAULT_COMMENT_CONTENT,
      createdAt: new Date(),
      ...overrides,
    },
  ]);
}
