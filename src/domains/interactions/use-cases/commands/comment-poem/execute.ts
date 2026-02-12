import type {
	CommandsRepository,
	CommentPoemParams,
} from '../../../ports/Commands';
import type {
	FriendsContractForInteractions,
	PoemsContractForInteractions,
	UsersContractForInteractions,
} from '../../../ports/ExternalServices';
import type { PoemComment } from '../../Models';
import { validator } from '../../validators/Global';

export interface CommentPoemDependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
	usersContract: UsersContractForInteractions;
	friendsContract: FriendsContractForInteractions;
}

export function commentPoemFactory({
	commandsRepository,
	poemsContract,
	usersContract,
	friendsContract,
}: CommentPoemDependencies) {
	return async function commentPoem(
		params: CommentPoemParams,
	): Promise<PoemComment> {
		const { userId, poemId, content } = params;
		const trimmedContent = content.trim();
		const v = validator();
		v.ensureResource(trimmedContent)
			.minLength(1)
			.maxLength(300)
			.bannedWords(['badword1', 'badword2']);

		const userInfo = await usersContract.getUserBasicInfo(userId);
		v.user(userInfo)
			.withStatus(['active'])
			.withRole(['moderator', 'admin', 'author']);

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);
		v.poem(poemInfo)
			.withModerationStatus(['approved'])
			.withVisibility(['public', 'friends'])
			.withStatus(['published'])
			.withCommentability(true);

		const usersRelationInfo = await friendsContract.usersRelation(
			userId,
			poemInfo.authorId,
		);
		v.relation(usersRelationInfo).withNoBlocking();

		if (poemInfo.visibility === 'friends' && userId !== poemInfo.authorId)
			v.relation(usersRelationInfo).withFriendhsip();

		return commandsRepository.createPoemComment({
			userId,
			poemId,
			content: trimmedContent,
		});
	};
}
