import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { getPoemCommentsFactory } from './execute';
import { PoemNotFoundError } from '../Errors';

describe('getPoemCommentsFactory', () => {
	let queriesRepository: {
		findCommentsByPoemId: ReturnType<typeof mock>;
		selectCommentById: ReturnType<typeof mock>;
		existsPoemLike: ReturnType<typeof mock>;
	};

	let poemsContract: {
		getPoemInteractionInfo: ReturnType<typeof mock>;
	};

	beforeEach(() => {
		queriesRepository = {
			findCommentsByPoemId: mock(),
			selectCommentById: mock(),
			existsPoemLike: mock(),
		};

		poemsContract = {
			getPoemInteractionInfo: mock(),
		};
	});

	it('returns comments for poem', async () => {
		const now = new Date();
		const comments = [
			{ id: 1, userId: 5, poemId: 10, content: 'Nice', createdAt: now },
			{ id: 2, userId: 6, poemId: 10, content: 'Great', createdAt: now },
		];

		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
		});

		queriesRepository.findCommentsByPoemId.mockResolvedValue(comments);

		const getPoemComments = getPoemCommentsFactory({
			queriesRepository,
			poemsContract,
		});

		const result = await getPoemComments({ poemId: 10 });

		expect(result).toEqual(comments);

		expect(queriesRepository.findCommentsByPoemId).toHaveBeenCalledWith({
			poemId: 10,
		});
	});

	it('throws PoemNotFoundError when poem does not exist', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: false,
		});

		const getPoemComments = getPoemCommentsFactory({
			queriesRepository,
			poemsContract,
		});

		await expect(getPoemComments({ poemId: 10 })).rejects.toBeInstanceOf(
			PoemNotFoundError,
		);

		expect(queriesRepository.findCommentsByPoemId).not.toHaveBeenCalled();
	});

	it('returns empty array when poem has no comments', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
		});

		queriesRepository.findCommentsByPoemId.mockResolvedValue([]);

		const getPoemComments = getPoemCommentsFactory({
			queriesRepository,
			poemsContract,
		});

		const result = await getPoemComments({ poemId: 10 });

		expect(result).toEqual([]);
	});

	it('propagates dependency errors', async () => {
		poemsContract.getPoemInteractionInfo.mockRejectedValue(new Error('boom'));

		const getPoemComments = getPoemCommentsFactory({
			queriesRepository,
			poemsContract,
		});

		await expect(getPoemComments({ poemId: 10 })).rejects.toThrow('boom');
	});
});
