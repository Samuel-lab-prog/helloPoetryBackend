import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { commentPoemFactory } from './execute';
import { EmptyCommentError, PoemNotFoundError } from '../../Errors';
import type { CommandsRepository } from '../../../ports/Commands';

describe('USE-CASE - Interactions', () => {
	describe('Comment Poem', () => {
		let createCommentMock: ReturnType<typeof mock>;
		let commandsRepository: CommandsRepository;
		let poemsContract: {
			getPoemInteractionInfo: ReturnType<typeof mock>;
		};

		beforeEach(() => {
			createCommentMock = mock();

			commandsRepository = {
				createPoemLike: mock(),
				deletePoemLike: mock(),
				deletePoemComment: mock(),
				findPoemLike: mock(),
				createPoemComment: createCommentMock,
			};

			poemsContract = {
				getPoemInteractionInfo: mock(),
			};
		});

		it('creates a comment when poem exists and content is valid', async () => {
			const newComment = {
				id: 1,
				userId: 5,
				poemId: 10,
				content: 'hello',
				createdAt: new Date(),
			};

			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
			});

			createCommentMock.mockResolvedValue(newComment);

			const commentPoem = commentPoemFactory({
				commandsRepository,
				poemsContract,
			});

			const result = await commentPoem({
				userId: 5,
				poemId: 10,
				content: 'hello',
			});

			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('content', 'hello');
		});

		it('trims whitespace from content before saving', async () => {
			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
			});

			createCommentMock.mockResolvedValue({});

			const commentPoem = commentPoemFactory({
				commandsRepository,
				poemsContract,
			});

			await commentPoem({
				userId: 1,
				poemId: 2,
				content: '   nice poem   ',
			});

			expect(createCommentMock).toHaveBeenCalledWith({
				userId: 1,
				poemId: 2,
				content: 'nice poem',
			});
		});

		it('throws EmptyCommentError when content is empty or whitespace', async () => {
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
		});

		it('propagates repository errors', async () => {
			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
			});

			createCommentMock.mockRejectedValue(new Error('db exploded'));

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
});
