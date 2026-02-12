import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { unlikePoemFactory } from './execute';
import { BadRequestError, ForbiddenError, NotFoundError } from '@DomainError';

describe('USE-CASE - Interactions', () => {
	describe('Unlike Poem', () => {
		let commandsRepository: {
			findPoemLike: ReturnType<typeof mock>;
			deletePoemLike: ReturnType<typeof mock>;
			createPoemLike: ReturnType<typeof mock>;
			createPoemComment: ReturnType<typeof mock>;
			deletePoemComment: ReturnType<typeof mock>;
		};

		let poemsContract: {
			getPoemInteractionInfo: ReturnType<typeof mock>;
		};

		let usersContract: {
			getUserBasicInfo: ReturnType<typeof mock>;
		};

		beforeEach(() => {
			commandsRepository = {
				findPoemLike: mock(),
				deletePoemLike: mock(),
				createPoemLike: mock(),
				createPoemComment: mock(),
				deletePoemComment: mock(),
			};

			poemsContract = {
				getPoemInteractionInfo: mock(),
			};

			usersContract = {
				getUserBasicInfo: mock(),
			};
		});

		it('unlikes poem successfully', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({ exists: true });
			commandsRepository.findPoemLike.mockResolvedValue({
				userId: 1,
				poemId: 10,
			});
			commandsRepository.deletePoemLike.mockResolvedValue({
				userId: 1,
				poemId: 10,
			});

			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			const result = await unlikePoem({ userId: 1, poemId: 10 });

			expect(result).toEqual({ userId: 1, poemId: 10 });
			expect(commandsRepository.deletePoemLike).toHaveBeenCalledWith({
				userId: 1,
				poemId: 10,
			});
		});

		it('rejects invalid user id', async () => {
			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			await expect(
				unlikePoem({ userId: 0, poemId: 10 }),
			).rejects.toBeInstanceOf(BadRequestError);
		});

		it('rejects invalid poem id', async () => {
			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			await expect(
				unlikePoem({ userId: 1, poemId: -10 }),
			).rejects.toBeInstanceOf(BadRequestError);
		});

		it('throws NotFoundError when user does not exist', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({ exists: false });

			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			await expect(
				unlikePoem({ userId: 1, poemId: 10 }),
			).rejects.toBeInstanceOf(NotFoundError);
			expect(poemsContract.getPoemInteractionInfo).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when user is not active', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'suspended',
			});

			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			await expect(
				unlikePoem({ userId: 1, poemId: 10 }),
			).rejects.toBeInstanceOf(ForbiddenError);
			expect(poemsContract.getPoemInteractionInfo).not.toHaveBeenCalled();
		});

		it('throws NotFoundError when poem does not exist', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({ exists: false });

			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			await expect(
				unlikePoem({ userId: 1, poemId: 10 }),
			).rejects.toBeInstanceOf(NotFoundError);
			expect(commandsRepository.findPoemLike).not.toHaveBeenCalled();
		});

		it('throws NotFoundError when like does not exist', async () => {
			usersContract.getUserBasicInfo.mockResolvedValue({
				exists: true,
				status: 'active',
			});
			poemsContract.getPoemInteractionInfo.mockResolvedValue({ exists: true });
			commandsRepository.findPoemLike.mockResolvedValue(null);

			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			await expect(
				unlikePoem({ userId: 1, poemId: 10 }),
			).rejects.toBeInstanceOf(NotFoundError);
			expect(commandsRepository.deletePoemLike).not.toHaveBeenCalled();
		});

		it('does not swallow dependency errors', async () => {
			usersContract.getUserBasicInfo.mockRejectedValue(new Error('boom'));

			const unlikePoem = unlikePoemFactory({
				commandsRepository,
				poemsContract,
				usersContract,
			});

			await expect(unlikePoem({ userId: 1, poemId: 10 })).rejects.toThrow(
				'boom',
			);
		});
	});
});
