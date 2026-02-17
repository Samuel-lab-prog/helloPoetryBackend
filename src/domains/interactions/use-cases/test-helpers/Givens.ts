import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

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
	DEFAULT_USER_NICKNAME,
	DEFAULT_POEM_TITLE,
} from './Constants';
import { givenResolved } from '@TestUtils';

export type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersPublicContract['selectUserBasicInfo']>>
>;
export type PoemInteractionInfoOverride = Partial<
	Awaited<ReturnType<PoemsPublicContract['selectPoemBasicInfo']>>
>;
export type UsersRelationInfoOverride = Partial<
	Awaited<ReturnType<FriendsPublicContract['selectUsersRelation']>>
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
export type SelectCommentByIdOverride = Partial<
	Awaited<ReturnType<QueriesRepository['selectCommentById']>>
>;

export function givenUser(
	userContract: InteractionsSutMocks['usersContract'],
	overrides: UserBasicInfoOverride = {},
) {
	givenResolved(userContract, 'selectUserBasicInfo', {
		exists: true,
		id: DEFAULT_PERFORMER_USER_ID,
		status: DEFAULT_USER_STATUS,
		role: DEFAULT_USER_ROLE,
		nickname: DEFAULT_USER_NICKNAME,
		...overrides,
	});
}

export function givenPoem(
	poemsContract: InteractionsSutMocks['poemsContract'],
	overrides: PoemInteractionInfoOverride = {},
) {
	givenResolved(poemsContract, 'selectPoemBasicInfo', {
		exists: true,
		id: DEFAULT_POEM_ID,
		authorId: DEFAULT_POEM_OWNER_USER_ID,
		visibility: DEFAULT_POEM_VISIBILITY,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		status: DEFAULT_POEM_STATUS,
		isCommentable: true,
		poemTitle: DEFAULT_POEM_TITLE,
		...overrides,
	});
}

export function givenUsersRelation(
	friendsContract: InteractionsSutMocks['friendsContract'],
	overrides: UsersRelationInfoOverride = {},
) {
	givenResolved(friendsContract, 'selectUsersRelation', {
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
	givenResolved(
		queriesRepository,
		'findPoemLike',
		exists
			? { userId: DEFAULT_PERFORMER_USER_ID, poemId: DEFAULT_POEM_ID }
			: null,
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

export function givenReplyCreatedComment(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
	overrides: CreatePoemCommentOverride = {},
) {
	givenResolved(commandsRepository, 'createCommentReply', {
		id: DEFAULT_COMMENT_ID,
		userId: DEFAULT_PERFORMER_USER_ID,
		content: DEFAULT_COMMENT_CONTENT,
		parentId: DEFAULT_COMMENT_ID,
		poemId: DEFAULT_POEM_ID,
		createdAt: new Date(),
		...overrides,
	});
}

export function givenCommentNotFound(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'selectCommentById', null);
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

export function givenFoundComment(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	overrides: SelectCommentByIdOverride = {},
) {
	givenResolved(queriesRepository, 'selectCommentById', {
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
	givenResolved(commandsRepository, 'deletePoemComment', undefined);
}
