import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { getPoemCommentsFactory } from './execute';
import { BadRequestError, ForbiddenError, NotFoundError } from '@DomainError';

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

		it('returns comments for an existing public poem', async () => {
			const comments = [
				{ id: 1, content: 'Nice' },
				{ id: 2, content: 'Great' },
			];

			poemsContract.getPoemInteractionInfo.mockResolvedValueOnce({
				exists: true,
				visibility: 'public',
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

		it('rejects invalid poem id', async () => {
			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			await expect(getPoemComments({ poemId: 0 })).rejects.toBeInstanceOf(
				BadRequestError,
			);
			expect(poemsContract.getPoemInteractionInfo).not.toHaveBeenCalled();
		});

		it('throws NotFoundError when poem does not exist', async () => {
			poemsContract.getPoemInteractionInfo.mockResolvedValueOnce({
				exists: false,
			});

			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			await expect(getPoemComments({ poemId: 10 })).rejects.toBeInstanceOf(
				NotFoundError,
			);

			expect(queriesRepository.findCommentsByPoemId).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when poem visibility is restricted', async () => {
			poemsContract.getPoemInteractionInfo.mockResolvedValueOnce({
				exists: true,
				visibility: 'friends',
			});

			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			await expect(getPoemComments({ poemId: 10 })).rejects.toBeInstanceOf(
				ForbiddenError,
			);
			expect(queriesRepository.findCommentsByPoemId).not.toHaveBeenCalled();
		});

		it('returns empty array when poem has no comments', async () => {
			poemsContract.getPoemInteractionInfo.mockResolvedValueOnce({
				exists: true,
				visibility: 'unlisted',
			});

			queriesRepository.findCommentsByPoemId.mockResolvedValueOnce([]);

			const getPoemComments = getPoemCommentsFactory({
				queriesRepository,
				poemsContract,
			});

			const result = await getPoemComments({ poemId: 10 });

			expect(result).toEqual([]);
		});

		it('propagates unexpected dependency errors', async () => {
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
