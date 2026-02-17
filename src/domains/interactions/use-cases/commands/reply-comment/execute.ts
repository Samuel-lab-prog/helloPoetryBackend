import type {
	CommandsRepository,
	ReplyCommentParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';

import type { CommentReply } from '../../../ports/Models';
import { validator } from '@SharedKernel/validators/Global';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';

import type { EventBus } from '@SharedKernel/events/EventBus';
import { NotFoundError } from '@DomainError';

export interface ReplyCommentDependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsPublicContract;
	usersContract: UsersPublicContract;
	friendsContract: FriendsPublicContract;
	queriesRepository: QueriesRepository;
	eventBus: EventBus;
}

export function replyCommentFactory({
	commandsRepository,
	queriesRepository,
	poemsContract,
	usersContract,
	friendsContract,
	eventBus,
}: ReplyCommentDependencies) {
	return async function replyComment(
		params: ReplyCommentParams,
	): Promise<CommentReply> {
		const { userId, parentCommentId, content } = params;

		const trimmedContent = content.trim();

		const v = validator();

		v.ensure(trimmedContent)
			.minLength(1)
			.maxLength(300)
			.bannedWords(['badword1', 'badword2']);

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const parentComment = await queriesRepository.selectCommentById({
			commentId: parentCommentId,
		});
		if (!parentComment) throw new NotFoundError('Parent comment not found');

		const poemInfo = await poemsContract.selectPoemBasicInfo(
			parentComment.poemId,
		);
		v.poem(poemInfo)
			.withModerationStatus(['approved'])
			.withVisibility(['public', 'friends', 'unlisted'])
			.withStatus(['published'])
			.withCommentability(true);

		const usersRelationInfo = await friendsContract.selectUsersRelation(
			userId,
			poemInfo.authorId,
		);
		v.relation(usersRelationInfo).withNoBlocking();

		if (poemInfo.visibility === 'friends' && userId !== poemInfo.authorId)
			v.relation(usersRelationInfo).withFriendship();

		const reply = await commandsRepository.createCommentReply({
			userId,
			parentCommentId,
			content: trimmedContent,
		});

		eventBus.publish('POEM_COMMENT_REPLIED', {
			commentId: reply.id,
			parentCommentId,
			poemId: parentComment.poemId,
			replierId: userId,
			originalCommenterId: parentComment.userId,
			replierNickname: userInfo.nickname,
			poemTitle: poemInfo.poemTitle,
		});

		return reply;
	};
}
