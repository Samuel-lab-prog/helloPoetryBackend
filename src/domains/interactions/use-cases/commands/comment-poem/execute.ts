import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { PoemsContractForInteractions } from '../../../ports/PoemServices';
import type { PoemComment } from '../models/Index';
import { PoemNotFoundError, EmptyCommentError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
}

export interface CommentPoemParams {
	userId: number;
	poemId: number;
	content: string;
}

export function commentPoemFactory({
	commandsRepository,
	poemsContract,
}: Dependencies) {
	return async function commentPoem(
		params: CommentPoemParams,
	): Promise<PoemComment> {
		const { userId, poemId, content } = params;
		if (!content.trim()) {
			throw new EmptyCommentError();
		}

		const poemResult = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemResult.exists) {
			throw new PoemNotFoundError();
		}

		return commandsRepository.createPoemComment({ userId, poemId, content });
	};
}
