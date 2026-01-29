import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { deleteCommentFactory } from './execute';
import { CommentNotFoundError, NotCommentOwnerError } from '../Errors';

describe('deleteCommentFactory', () => {
	let commandsRepository: {
		deletePoemComment: ReturnType<typeof mock>;
		findPoemLike: ReturnType<typeof mock>;
		createPoemLike: ReturnType<typeof mock>;
		deletePoemLike: ReturnType<typeof mock>;
		createPoemComment: ReturnType<typeof mock>;
	};

	let queriesRepository: {
		selectCommentById: ReturnType<typeof mock>;
		findCommentsByPoemId: ReturnType<typeof mock>;
		existsPoemLike: ReturnType<typeof mock>;
	};

	beforeEach(() => {
		commandsRepository = {
			deletePoemComment: mock(),
			findPoemLike: mock(),
			createPoemLike: mock(),
			deletePoemLike: mock(),
			createPoemComment: mock(),
		};

		queriesRepository = {
			selectCommentById: mock(),
			findCommentsByPoemId: mock(),
			existsPoemLike: mock(),
		};
	});

	it('deletes comment when user is owner', async () => {
		queriesRepository.selectCommentById.mockResolvedValue({
			id: 10,
			userId: 5,
			content: 'hello',
		});

		commandsRepository.deletePoemComment.mockResolvedValue(undefined);

		const deleteComment = deleteCommentFactory({
			commandsRepository,
			queriesRepository,
		});

		const result = await deleteComment({
			userId: 5,
			commentId: 10,
		});

		expect(result).toBeUndefined();

		expect(queriesRepository.selectCommentById).toHaveBeenCalledTimes(1);
		expect(queriesRepository.selectCommentById).toHaveBeenCalledWith({
			commentId: 10,
		});

		expect(commandsRepository.deletePoemComment).toHaveBeenCalledTimes(1);
		expect(commandsRepository.deletePoemComment).toHaveBeenCalledWith({
			commentId: 10,
		});
	});

	it('throws CommentNotFoundError when comment does not exist', async () => {
		queriesRepository.selectCommentById.mockResolvedValue(null);

		const deleteComment = deleteCommentFactory({
			commandsRepository,
			queriesRepository,
		});

		await expect(
			deleteComment({
				userId: 1,
				commentId: 99,
			}),
		).rejects.toBeInstanceOf(CommentNotFoundError);

		expect(queriesRepository.selectCommentById).toHaveBeenCalledTimes(1);
		expect(commandsRepository.deletePoemComment).not.toHaveBeenCalled();
	});

	it('throws NotCommentOwnerError when user is not owner', async () => {
		queriesRepository.selectCommentById.mockResolvedValue({
			id: 10,
			userId: 7,
			content: 'hello',
		});

		const deleteComment = deleteCommentFactory({
			commandsRepository,
			queriesRepository,
		});

		await expect(
			deleteComment({
				userId: 5,
				commentId: 10,
			}),
		).rejects.toBeInstanceOf(NotCommentOwnerError);

		expect(queriesRepository.selectCommentById).toHaveBeenCalledTimes(1);
		expect(commandsRepository.deletePoemComment).not.toHaveBeenCalled();
	});

	it('does not swallow repository errors', async () => {
		queriesRepository.selectCommentById.mockRejectedValue(
			new Error('db exploded'),
		);

		const deleteComment = deleteCommentFactory({
			commandsRepository,
			queriesRepository,
		});

		await expect(
			deleteComment({
				userId: 1,
				commentId: 2,
			}),
		).rejects.toThrow('db exploded');

		expect(commandsRepository.deletePoemComment).not.toHaveBeenCalled();
	});

	it('does not swallow delete command errors', async () => {
		queriesRepository.selectCommentById.mockResolvedValue({
			id: 3,
			userId: 3,
			content: 'hey',
		});

		commandsRepository.deletePoemComment.mockRejectedValue(
			new Error('delete failed'),
		);

		const deleteComment = deleteCommentFactory({
			commandsRepository,
			queriesRepository,
		});

		await expect(
			deleteComment({
				userId: 3,
				commentId: 3,
			}),
		).rejects.toThrow('delete failed');
	});
});
