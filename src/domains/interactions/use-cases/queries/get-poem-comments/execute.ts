import type {
	QueriesRepository,
	GetPoemCommentsParams,
} from '../../../ports/Queries';

import type {
	PoemsContractForInteractions,
	UsersContractForInteractions,
	FriendsContractForInteractions,
} from '../../../ports/ExternalServices';

import type { PoemComment } from '../../Models';
import { validator } from '@SharedKernel/validators/Global';

export interface GetPoemCommentsDependencies {
	queriesRepository: QueriesRepository;
	poemsContract: PoemsContractForInteractions;
	usersContract: UsersContractForInteractions;
	friendsContract: FriendsContractForInteractions;
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
		const { poemId, userId } = params;

		const v = validator();

		const userInfo = await usersContract.getUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);
		v.poem(poemInfo)
			.withModerationStatus(['approved'])
			.withVisibility(['public', 'friends', 'unlisted'])
			.withStatus(['published'])
			.withCommentability(true);

		const usersRelationInfo = await friendsContract.usersRelation(
			userId,
			poemInfo.authorId,
		);
		v.relation(usersRelationInfo).withNoBlocking();

		if (poemInfo.visibility === 'friends' && userId !== poemInfo.authorId)
			v.relation(usersRelationInfo).withFriendship();

		return queriesRepository.findCommentsByPoemId({ poemId });
	};
}
