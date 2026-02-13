/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from 'bun:test';
import type {
	UsersContractForInteractions,
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../../ports/ExternalServices';
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
import { createMockedContract } from '@TestUtils';
import type { InteractionsSutMocks } from './SutMocks';
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

const interactionsTestModule = {
	makeSut<TFactory extends (deps: typeof interactionsMockFactories) => any>(
		factory: TFactory,
	) {
		const mocks: typeof interactionsMockFactories = {
			...interactionsMockFactories,
		};
		const sut = factory(mocks);
		return { sut, mocks };
	},
};

function makeParams<T>(defaults: T, overrides?: Partial<T>): T {
	return { ...defaults, ...overrides };
}

export const makeInteractionsScenario = (() => {
	const { sut: sutFactory, mocks } =
		interactionsTestModule.makeSut(interactionsFactory);

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
