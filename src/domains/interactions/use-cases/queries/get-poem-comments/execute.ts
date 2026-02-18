import type {
	QueriesRepository,
	GetPoemCommentsParams,
} from '../../../ports/Queries';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';

import type { PoemComment } from '../../../ports/Models';
import { validator } from '@SharedKernel/validators/Global';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';

export interface GetPoemCommentsDependencies {
	queriesRepository: QueriesRepository;
	poemsContract: PoemsPublicContract;
	usersContract: UsersPublicContract;
	friendsContract: FriendsPublicContract;
}

export function getPoemCommentsFactory({
	queriesRepository,
	poemsContract,
	usersContract,
	friendsContract,
}: GetPoemCommentsDependencies) {
	return async function getPoemComments(
		params: GetPoemCommentsParams,
	): Promise<PoemComment[]> {
		const { poemId, userId, parentId } = params;

		const v = validator();

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

		return queriesRepository.selectCommentsByPoemId({
			poemId,
			parentId,
			currentUserId: userId,
		});
	};
}
