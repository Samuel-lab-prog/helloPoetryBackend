import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { PoemsContractForInteractions } from '../../../ports/PoemServices';
import type { PoemComment } from '../../Models';
import { PoemNotFoundError, EmptyCommentError } from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
}

export type CommentPoemParams = {
	userId: number;
	poemId: number;
	content: string;
};

export function commentPoemFactory({
	commandsRepository,
	poemsContract,
}: Dependencies) {
	return async function commentPoem(
		params: CommentPoemParams,
	): Promise<PoemComment> {
		const { userId, poemId, content } = params;

		const trimmedContent = content.trim();
		if (!trimmedContent) throw new EmptyCommentError();

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) throw new PoemNotFoundError();

		return commandsRepository.createPoemComment({
			userId,
			poemId,
			content: trimmedContent,
		});
	};
}
