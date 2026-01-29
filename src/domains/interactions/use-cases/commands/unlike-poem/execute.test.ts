import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { unlikePoemFactory } from './execute';
import { PoemNotFoundError, LikeNotFoundError } from '../Errors';

describe('unlikePoemFactory', () => {
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
	});

	it('unlikes poem successfully', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
		});

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
		});

		const result = await unlikePoem({
			userId: 1,
			poemId: 10,
		});

		expect(result).toEqual({
			userId: 1,
			poemId: 10,
		});

		expect(commandsRepository.deletePoemLike).toHaveBeenCalledWith({
			userId: 1,
			poemId: 10,
		});
	});

	it('throws PoemNotFoundError when poem does not exist', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: false,
		});

		const unlikePoem = unlikePoemFactory({
			commandsRepository,
			poemsContract,
		});

		await expect(unlikePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
			PoemNotFoundError,
		);

		expect(commandsRepository.findPoemLike).not.toHaveBeenCalled();
	});

	it('throws LikeNotFoundError when like does not exist', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
		});

		commandsRepository.findPoemLike.mockResolvedValue(null);

		const unlikePoem = unlikePoemFactory({
			commandsRepository,
			poemsContract,
		});

		await expect(unlikePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
			LikeNotFoundError,
		);

		expect(commandsRepository.deletePoemLike).not.toHaveBeenCalled();
	});

	it('does not swallow dependency errors', async () => {
		poemsContract.getPoemInteractionInfo.mockRejectedValue(new Error('boom'));

		const unlikePoem = unlikePoemFactory({
			commandsRepository,
			poemsContract,
		});

		await expect(unlikePoem({ userId: 1, poemId: 10 })).rejects.toThrow('boom');
	});
});
