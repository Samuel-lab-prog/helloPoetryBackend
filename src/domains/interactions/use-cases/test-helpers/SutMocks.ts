import { type MockedContract, createMockedContract } from '@TestUtils';
import { mock } from 'bun:test';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import {
	type EventBus,
	createInMemoryEventBus,
} from '@SharedKernel/events/EventBus';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import { getPoemCommentsFactory } from '../queries/get-poem-comments/execute';
import { likeCommentFactory } from '../commands/like-comment/execute';
import { unlikeCommentFactory } from '../commands/unlike-comment/execute';

export type InteractionsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	poemsContract: MockedContract<PoemsPublicContract>;
	usersContract: MockedContract<UsersPublicContract>;
	friendsContract: MockedContract<FriendsPublicContract>;
	eventBus: EventBus;
};

import {
	commentPoemFactory,
	likePoemFactory,
	deleteCommentFactory,
	unlikePoemFactory,
} from '../commands/Index';
import { updateCommentFactory } from '../commands/update-comment/execute';

export function interactionsMockFactories() {
	return {
		usersContract: createMockedContract<UsersPublicContract>({
			selectUserBasicInfo: mock(),
			selectAuthUserByEmail: mock(),
		}),

		poemsContract: createMockedContract<PoemsPublicContract>({
			selectPoemBasicInfo: mock(),
		}),

		friendsContract: createMockedContract<FriendsPublicContract>({
			selectUsersRelation: mock(),
			selectBlockedUserIds: mock(),
			selectFollowedUserIds: mock(),
			areFriends: mock(),
			areBlocked: mock(),
			selectRelation: mock(),
		}),

		commandsRepository: createMockedContract<CommandsRepository>({
			createPoemComment: mock(),
			deletePoemComment: mock(),
			createPoemLike: mock(),
			deletePoemLike: mock(),
			deleteCommentLike: mock(),
			createCommentLike: mock(),
			updateComment: mock(),
		}),

		queriesRepository: createMockedContract<QueriesRepository>({
			selectCommentById: mock(),
			selectCommentsByPoemId: mock(),
			selectPoemLike: mock(),
			selectCommentLike: mock(),
		}),

		eventBus: createInMemoryEventBus(),
	};
}

type InteractionsDeps = ReturnType<typeof interactionsMockFactories>;

export function interactionsFactory(deps: InteractionsDeps) {
	return {
		commentPoem: commentPoemFactory(deps),
		likePoem: likePoemFactory(deps),
		removeLikePoem: unlikePoemFactory(deps),
		deleteComment: deleteCommentFactory(deps),
		getPoemComments: getPoemCommentsFactory(deps),
		likeComment: likeCommentFactory(deps),
		unlikeComment: unlikeCommentFactory(deps),
		updateComment: updateCommentFactory(deps),
	};
}
