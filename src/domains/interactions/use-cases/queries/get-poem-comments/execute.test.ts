import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { getPoemCommentsFactory } from './execute';
import { PoemNotFoundError } from '../../Errors';

describe('USE-CASE - Interactions', () => {
	describe('Get Poem Comments', () => {
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

		it('Returns comments for an existing poem', async () => {
			const comments = [
				{ id: 1, content: 'Nice' },
				{ id: 2, content: 'Great' },
			];

			poemsContract.getPoemInteractionInfo.mockResolvedValueOnce({
				exists: true,
			});

			queriesRepository.findCommentsByPoemId.mockResolvedValueOnce(comments);

			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			const result = await getPoemComments({ poemId: 10 });

			expect(result).toHaveLength(2);
			expect(result[0]).toHaveProperty('id', 1);

			expect(queriesRepository.findCommentsByPoemId).toHaveBeenCalledWith({
				poemId: 10,
			});
		});

		it('Throws PoemNotFoundError when poem does not exist', async () => {
			poemsContract.getPoemInteractionInfo.mockResolvedValueOnce({
				exists: false,
			});

			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			await expect(getPoemComments({ poemId: 10 })).rejects.toThrow(
				PoemNotFoundError,
			);

			expect(queriesRepository.findCommentsByPoemId).not.toHaveBeenCalled();
		});

		it('Returns empty array when poem has no comments', async () => {
			poemsContract.getPoemInteractionInfo.mockResolvedValueOnce({
				exists: true,
			});

			queriesRepository.findCommentsByPoemId.mockResolvedValueOnce([]);

			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			const result = await getPoemComments({ poemId: 10 });

			expect(result).toEqual([]);
		});

		it('Propagates unexpected dependency errors', async () => {
			poemsContract.getPoemInteractionInfo.mockRejectedValueOnce(
				new Error('boom'),
			);

			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			await expect(getPoemComments({ poemId: 10 })).rejects.toThrow('boom');
		});
	});
});
