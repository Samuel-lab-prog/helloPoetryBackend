import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { deleteCommentFactory } from './execute';
import { BadRequestError, ForbiddenError, NotFoundError } from '@DomainError';

describe('USE-CASE - Interactions', () => {
	describe('Delete Comment', () => {
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

		let usersContract: {
			getUserBasicInfo: ReturnType<typeof mock>;
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

			usersContract = {
				getUserBasicInfo: mock(),
			};
		});

		it('deletes comment when user is owner', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			queriesRepository.selectCommentById.mockResolvedValue({
				id: 10,
				userId: 5,
				content: 'hello',
			});
			commandsRepository.deletePoemComment.mockResolvedValue(undefined);

			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			const result = await deleteComment({
				userId: 5,
				commentId: 10,
			});

			expect(result).toBeUndefined();
			expect(queriesRepository.selectCommentById).toHaveBeenCalledWith({
				commentId: 10,
			});
			expect(commandsRepository.deletePoemComment).toHaveBeenCalledWith({
				commentId: 10,
			});
		});

		it('rejects invalid user id', async () => {
			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 0,
					commentId: 10,
				}),
			).rejects.toBeInstanceOf(BadRequestError);
			expect(usersContract.getUserBasicInfo).not.toHaveBeenCalled();
		});

		it('rejects invalid comment id', async () => {
			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 1,
					commentId: -10,
				}),
			).rejects.toBeInstanceOf(BadRequestError);
			expect(usersContract.getUserBasicInfo).not.toHaveBeenCalled();
		});

		it('throws NotFoundError when user does not exist', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({ exists: false });

			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 1,
					commentId: 99,
				}),
			).rejects.toBeInstanceOf(NotFoundError);
			expect(queriesRepository.selectCommentById).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when user is not active', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'banned',
			});

			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 1,
					commentId: 99,
				}),
			).rejects.toBeInstanceOf(ForbiddenError);
			expect(queriesRepository.selectCommentById).not.toHaveBeenCalled();
		});

		it('throws NotFoundError when comment does not exist', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			queriesRepository.selectCommentById.mockResolvedValue(null);

			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 1,
					commentId: 99,
				}),
			).rejects.toBeInstanceOf(NotFoundError);

			expect(commandsRepository.deletePoemComment).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when user is not owner', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			queriesRepository.selectCommentById.mockResolvedValue({
				id: 10,
				userId: 7,
				content: 'hello',
			});

			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 5,
					commentId: 10,
				}),
			).rejects.toBeInstanceOf(ForbiddenError);

			expect(commandsRepository.deletePoemComment).not.toHaveBeenCalled();
		});

		it('propagates query repository errors', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			queriesRepository.selectCommentById.mockRejectedValue(
				new Error('db exploded'),
			);

			const deleteComment = deleteCommentFactory({
				commandsRepository,
				queriesRepository,
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 1,
					commentId: 2,
				}),
			).rejects.toThrow('db exploded');

			expect(commandsRepository.deletePoemComment).not.toHaveBeenCalled();
		});

		it('propagates delete command errors', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
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
				usersContract,
			});

			await expect(
				deleteComment({
					userId: 3,
					commentId: 3,
				}),
			).rejects.toThrow('delete failed');
		});
	});
});
