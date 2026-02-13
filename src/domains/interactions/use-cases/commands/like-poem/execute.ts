import type {
	CommandsRepository,
	LikePoemParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type {
	FriendsContractForInteractions,
	PoemsContractForInteractions,
	UsersContractForInteractions,
} from '../../../ports/ExternalServices';
import type { PoemLike } from '../../Models';
import { ConflictError } from '@DomainError';
import { validator } from '../../validators/Global';

export interface LikePoemDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	friendsContract: FriendsContractForInteractions;
	usersContract: UsersContractForInteractions;
	poemsContract: PoemsContractForInteractions;
}

export function likePoemFactory({
	commandsRepository,
	queriesRepository,
	friendsContract,
	usersContract,
	poemsContract,
}: LikePoemDependencies) {
	return async function likePoem(params: LikePoemParams): Promise<PoemLike> {
		const { userId, poemId } = params;
		const v = validator();

		const userInfo = await usersContract.getUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);
		v.poem(poemInfo)
			.withStatus(['published'])
			.withVisibility(['public', 'friends', 'unlisted'])
			.withStatus(['published'])
			.withModerationStatus(['approved']);

		const authorId = poemInfo.authorId;
		const usersRelationInfo = await friendsContract.usersRelation(
			userId,
			authorId,
		);
		v.relation(usersRelationInfo).withNoBlocking();

		if (poemInfo.visibility === 'friends' && userId !== authorId)
			v.relation(usersRelationInfo).withFriendship();

		const alreadyLiked = await queriesRepository.findPoemLike({
			userId,
			poemId,
		});
		if (alreadyLiked) throw new ConflictError('Poem already liked');

		return commandsRepository.createPoemLike({ userId, poemId });
	};
}
