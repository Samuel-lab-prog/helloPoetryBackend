import { mock } from 'bun:test';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

import type {
	CommandsRepository,
	CommentPoemParams,
	DeleteCommentParams,
	LikePoemParams,
	UnlikePoemParams,
} from '../../ports/Commands';
import type {
	GetPoemCommentsParams,
	QueriesRepository,
} from '../../ports/Queries';
import {
	createMockedContract,
	makeParams,
	makeSut,
	type MockedContract,
} from '@TestUtils';
import {
	givenUser,
	givenPoem,
	givenUsersRelation,
	givenPoemLikeDeleted,
	givenDeletedComment,
	givenPoemLikeCreated,
	givenPoemLikeExists,
	givenCreatedComment,
	givenExistingComments,
	givenFoundComment,
	type UserBasicInfoOverride,
	type PoemInteractionInfoOverride,
	type UsersRelationInfoOverride,
	type DeletePoemLikeOverride,
	type CreatePoemLikeOverride,
	type CreatePoemCommentOverride,
	type FindCommentsOverride,
	type SelectCommentByIdOverride,
} from './Givens';
import {
	commentPoemFactory,
	likePoemFactory,
	deleteCommentFactory,
	unlikePoemFactory,
} from '../commands/Index';
import { getPoemCommentsFactory } from '../queries/get-poem-comments/execute';
import {
	DEFAULT_COMMENT_CONTENT,
	DEFAULT_COMMENT_ID,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_POEM_ID,
} from './Constants';

const interactionsMockFactories = {
	usersContract: createMockedContract<UsersPublicContract>({
		selectUserBasicInfo: mock(),
	}),
	poemsContract: createMockedContract<PoemsPublicContract>({
		selectPoemBasicInfo: mock(),
	}),
	friendsContract: createMockedContract<FriendsPublicContract>({
		selectUsersRelation: mock(),
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
};

export type InteractionsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	poemsContract: MockedContract<PoemsPublicContract>;
	usersContract: MockedContract<UsersPublicContract>;
	friendsContract: MockedContract<FriendsPublicContract>;
};

function interactionsFactory(deps: typeof interactionsMockFactories) {
	return {
		commentPoem: commentPoemFactory(deps),
		likePoem: likePoemFactory(deps),
		removeLikePoem: unlikePoemFactory(deps),
		deleteComment: deleteCommentFactory(deps),
		getPoemComments: getPoemCommentsFactory(deps),
	};
}

export const makeInteractionsScenario = (() => {
	const { sut: sutFactory, mocks } = makeSut(
		interactionsFactory,
		interactionsMockFactories,
	);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},

		withPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPoem(mocks.poemsContract, overrides);
			return this;
		},

		withUsersRelation(overrides: UsersRelationInfoOverride = {}) {
			givenUsersRelation(mocks.friendsContract, overrides);
			return this;
		},

		withCreatedComment(overrides: CreatePoemCommentOverride = {}) {
			givenCreatedComment(mocks.commandsRepository, overrides);
			return this;
		},

		withExistingComments(overrides: FindCommentsOverride = {}) {
			givenExistingComments(mocks.queriesRepository, overrides);
			return this;
		},

		withFoundComment(overrides: SelectCommentByIdOverride = {}) {
			givenFoundComment(mocks.queriesRepository, overrides);
			return this;
		},

		withPoemLikeCreated(overrides: CreatePoemLikeOverride = {}) {
			givenPoemLikeCreated(mocks.commandsRepository, overrides);
			return this;
		},

		withPoemLikeDeleted(overrides: DeletePoemLikeOverride = {}) {
			givenPoemLikeDeleted(mocks.commandsRepository, overrides);
			return this;
		},

		withDeletedComment() {
			givenDeletedComment(mocks.commandsRepository);
			return this;
		},

		withPoemLikeExists(exists: boolean) {
			givenPoemLikeExists(mocks.queriesRepository, exists);
			return this;
		},

		executeCommentPoem(params: Partial<CommentPoemParams> = {}) {
			return sutFactory.commentPoem(
				makeParams(
					{
						userId: DEFAULT_PERFORMER_USER_ID,
						poemId: DEFAULT_POEM_ID,
						content: DEFAULT_COMMENT_CONTENT,
					},
					params,
				),
			);
		},

		executeLikePoem(params: Partial<LikePoemParams> = {}) {
			return sutFactory.likePoem(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, poemId: DEFAULT_POEM_ID },
					params,
				),
			);
		},

		executeRemoveLike(params: Partial<UnlikePoemParams> = {}) {
			return sutFactory.removeLikePoem(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, poemId: DEFAULT_POEM_ID },
					params,
				),
			);
		},

		executeDeleteComment(params: Partial<DeleteCommentParams> = {}) {
			return sutFactory.deleteComment(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, commentId: DEFAULT_COMMENT_ID },
					params,
				),
			);
		},

		executeGetPoemComments(params: Partial<GetPoemCommentsParams> = {}) {
			return sutFactory.getPoemComments(
				makeParams(
					{ poemId: DEFAULT_POEM_ID, userId: DEFAULT_PERFORMER_USER_ID },
					params,
				),
			);
		},

		get mocks(): InteractionsSutMocks {
			return mocks;
		},
	};
})();
