import type {
  CommandsRepository,
  CommentPoemParams,
} from '../../../ports/Commands';

import type { PoemComment } from '../../Models';
import { validator } from '@SharedKernel/validators/Global';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';

import type { EventBus } from '@SharedKernel/events/EventBus';

export interface CommentPoemDependencies {
  commandsRepository: CommandsRepository;
  poemsContract: PoemsPublicContract;
  usersContract: UsersPublicContract;
  friendsContract: FriendsPublicContract;
  eventBus: EventBus; 
}

export function commentPoemFactory({
  commandsRepository,
  poemsContract,
  usersContract,
  friendsContract,
  eventBus,
}: CommentPoemDependencies) {
  return async function commentPoem(
    params: CommentPoemParams,
  ): Promise<PoemComment> {
    const { userId, poemId, content } = params;

    const trimmedContent = content.trim();

    const v = validator();

    v.ensure(trimmedContent)
      .minLength(1)
      .maxLength(300)
      .bannedWords(['badword1', 'badword2']);

    const userInfo = await usersContract.selectUserBasicInfo(userId);

    v.user(userInfo).withStatus(['active']);

    const poemInfo = await poemsContract.selectPoemBasicInfo(poemId);

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
    

    const comment = await commandsRepository.createPoemComment({
      userId,
      poemId,
      content: trimmedContent,
    });

    await eventBus.publish('poem.comment.created', {
      commentId: comment.id,
      poemId,
      authorId: poemInfo.authorId,
      commenterId: userId,
    });

    return comment;
  };
}
