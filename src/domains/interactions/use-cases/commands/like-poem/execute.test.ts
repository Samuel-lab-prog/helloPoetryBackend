import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { likePoemFactory } from './execute';
import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from '@DomainError';

describe('USE-CASE - Interactions', () => {
	describe('Like Poem', () => {
		let commandsRepository: {
			createPoemLike: ReturnType<typeof mock>;
			findPoemLike: ReturnType<typeof mock>;
			deletePoemLike: ReturnType<typeof mock>;
			createPoemComment: ReturnType<typeof mock>;
			deletePoemComment: ReturnType<typeof mock>;
		};

		let queriesRepository: {
			existsPoemLike: ReturnType<typeof mock>;
			selectCommentById: ReturnType<typeof mock>;
			findCommentsByPoemId: ReturnType<typeof mock>;
		};

		let poemsContract: {
			getPoemInteractionInfo: ReturnType<typeof mock>;
		};

		let usersContract: {
			getUserBasicInfo: ReturnType<typeof mock>;
		};

		let friendsServices: {
			areFriends: ReturnType<typeof mock>;
			areBlocked: ReturnType<typeof mock>;
		};

		beforeEach(() => {
			commandsRepository = {
				createPoemLike: mock(),
				findPoemLike: mock(),
				deletePoemLike: mock(),
				createPoemComment: mock(),
				deletePoemComment: mock(),
			};

			queriesRepository = {
				existsPoemLike: mock(),
				selectCommentById: mock(),
				findCommentsByPoemId: mock(),
			};

			poemsContract = {
				getPoemInteractionInfo: mock(),
			};

			usersContract = {
				getUserBasicInfo: mock(),
			};

			friendsServices = {
				areFriends: mock(),
				areBlocked: mock(),
			};
		});

		it('likes poem successfully', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
				authorId: 2,
				visibility: 'public',
			});
			friendsServices.areBlocked.mockResolvedValue(false);
			queriesRepository.existsPoemLike.mockResolvedValue(false);
			commandsRepository.createPoemLike.mockResolvedValue({
				userId: 1,
				poemId: 10,
			});

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			const result = await likePoem({ userId: 1, poemId: 10 });

			expect(result).toEqual({ userId: 1, poemId: 10 });
			expect(commandsRepository.createPoemLike).toHaveBeenCalledWith({
				userId: 1,
				poemId: 10,
			});
		});

		it('rejects invalid user id', async () => {
			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 0, poemId: 10 })).rejects.toBeInstanceOf(
				BadRequestError,
			);
			expect(usersContract.getUserBasicInfo).not.toHaveBeenCalled();
		});

		it('rejects invalid poem id', async () => {
			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: -1 })).rejects.toBeInstanceOf(
				BadRequestError,
			);
			expect(usersContract.getUserBasicInfo).not.toHaveBeenCalled();
		});

		it('throws NotFoundError when user does not exist', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({ exists: false });

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
				NotFoundError,
			);
			expect(poemsContract.getPoemInteractionInfo).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when user is not active', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'banned',
			});

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
				ForbiddenError,
			);
			expect(poemsContract.getPoemInteractionInfo).not.toHaveBeenCalled();
		});

		it('throws NotFoundError when poem does not exist', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({ exists: false });

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
				NotFoundError,
			);
			expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when poem is private and user is not author', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
				authorId: 2,
				visibility: 'private',
			});

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
				ForbiddenError,
			);
			expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when poem is friends-only and users are not friends', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
				authorId: 2,
				visibility: 'friends',
			});
			friendsServices.areFriends.mockResolvedValue(false);

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
				ForbiddenError,
			);
			expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when users are blocked in either direction', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
				authorId: 2,
				visibility: 'public',
			});
			friendsServices.areBlocked.mockResolvedValueOnce(false);
			friendsServices.areBlocked.mockResolvedValueOnce(true);

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
				ForbiddenError,
			);
			expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
		});

		it('throws ConflictError when poem already liked', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({
				exists: true,
				authorId: 2,
				visibility: 'public',
			});
			friendsServices.areBlocked.mockResolvedValue(false);
			queriesRepository.existsPoemLike.mockResolvedValue(true);

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
				ConflictError,
			);
			expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
		});

		it('does not swallow dependency errors', async () => {
			usersContract.getUserBasicInfo.mockRejectedValue(new Error('boom'));

			const likePoem = likePoemFactory({
				commandsRepository,
				queriesRepository,
				poemsContract,
				friendsServices,
				usersContract,
			});

			await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toThrow('boom');
		});
	});
});
