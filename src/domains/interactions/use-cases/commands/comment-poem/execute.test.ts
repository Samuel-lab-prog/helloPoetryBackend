import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { commentPoemFactory } from './execute';
import { EmptyCommentError, PoemNotFoundError } from '../Errors';

describe('commentPoemFactory', () => {
	let commandsRepository: {
		createPoemComment: ReturnType<typeof mock>;
		findPoemLike: ReturnType<typeof mock>;
		createPoemLike: ReturnType<typeof mock>;
		deletePoemLike: ReturnType<typeof mock>;
		deletePoemComment: ReturnType<typeof mock>;
	};

	let poemsContract: {
		getPoemInteractionInfo: ReturnType<typeof mock>;
	};

	beforeEach(() => {
		commandsRepository = {
			createPoemComment: mock(),
			findPoemLike: mock(),
			createPoemLike: mock(),
			deletePoemLike: mock(),
			deletePoemComment: mock(),
		};

		poemsContract = {
			getPoemInteractionInfo: mock(),
		};
	});

	it('creates comment when content is valid and poem exists', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
		});

		commandsRepository.createPoemComment.mockResolvedValue({
			id: 1,
			userId: 5,
			poemId: 10,
			content: 'hello',
			createdAt: new Date(),
		});

		const commentPoem = commentPoemFactory({
			commandsRepository,
			poemsContract,
		});

		await commentPoem({
			userId: 5,
			poemId: 10,
			content: 'hello',
		});

		expect(poemsContract.getPoemInteractionInfo).toHaveBeenCalledTimes(1);
		expect(poemsContract.getPoemInteractionInfo).toHaveBeenCalledWith(10);

		expect(commandsRepository.createPoemComment).toHaveBeenCalledTimes(1);
		expect(commandsRepository.createPoemComment).toHaveBeenCalledWith({
			userId: 5,
			poemId: 10,
			content: 'hello',
		});
	});

	it('trims whitespace before saving', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
		});

		commandsRepository.createPoemComment.mockResolvedValue({});

		const commentPoem = commentPoemFactory({
			commandsRepository,
			poemsContract,
		});

		await commentPoem({
			userId: 1,
			poemId: 2,
			content: '   nice poem   ',
		});

		expect(commandsRepository.createPoemComment).toHaveBeenCalledWith({
			userId: 1,
			poemId: 2,
			content: 'nice poem',
		});
	});

	it('throws EmptyCommentError when content is empty', async () => {
		const commentPoem = commentPoemFactory({
			commandsRepository,
			poemsContract,
		});

		await expect(
			commentPoem({
				userId: 1,
				poemId: 2,
				content: '   ',
			}),
		).rejects.toBeInstanceOf(EmptyCommentError);

		expect(poemsContract.getPoemInteractionInfo).not.toHaveBeenCalled();
		expect(commandsRepository.createPoemComment).not.toHaveBeenCalled();
	});

	it('throws PoemNotFoundError when poem does not exist', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: false,
		});

		const commentPoem = commentPoemFactory({
			commandsRepository,
			poemsContract,
		});

		await expect(
			commentPoem({
				userId: 3,
				poemId: 99,
				content: 'hello',
			}),
		).rejects.toBeInstanceOf(PoemNotFoundError);

		expect(poemsContract.getPoemInteractionInfo).toHaveBeenCalledTimes(1);
		expect(commandsRepository.createPoemComment).not.toHaveBeenCalled();
	});

	it('does not swallow repository errors', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
		});

		commandsRepository.createPoemComment.mockRejectedValue(
			new Error('db exploded'),
		);

		const commentPoem = commentPoemFactory({
			commandsRepository,
			poemsContract,
		});

		await expect(
			commentPoem({
				userId: 1,
				poemId: 2,
				content: 'hi',
			}),
		).rejects.toThrow('db exploded');
	});
});
