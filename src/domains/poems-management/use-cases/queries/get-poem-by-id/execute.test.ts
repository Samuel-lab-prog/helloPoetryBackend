import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { getPoemFactory } from './execute';
import { PoemNotFoundError, PoemAccessDeniedError } from '../errors';

let poemQueriesRepository: any;
let getPoem: ReturnType<typeof getPoemFactory>;

beforeEach(() => {
	poemQueriesRepository = {
		selectPoemById: mock(),
	};

	getPoem = getPoemFactory({ poemQueriesRepository });
});

describe('getPoem use case', () => {
	const poem = {
		id: 10,
		status: 'published',
		visibility: 'friends-only',
		author: { id: 2, friendsIds: [1, 3] },
		content: 'Some content',
	};

	it('should throw PoemNotFoundError if poem does not exist', async () => {
		poemQueriesRepository.selectPoemById.mockResolvedValue(null);

		await expect(getPoem({ requesterId: 1, poemId: 999 })).rejects.toThrow(
			PoemNotFoundError,
		);
	});

	it('should throw PoemAccessDeniedError if requester cannot view poem', async () => {
		const privatePoem = { ...poem, visibility: 'private' };
		poemQueriesRepository.selectPoemById.mockResolvedValue(privatePoem);

		await expect(getPoem({ requesterId: 1, poemId: 10 })).rejects.toThrow(
			PoemAccessDeniedError,
		);
	});

	it('should propagate repository errors', async () => {
		poemQueriesRepository.selectPoemById.mockRejectedValue(
			new Error('DB failure'),
		);

		await expect(getPoem({ requesterId: 1, poemId: 10 })).rejects.toThrow(
			'DB failure',
		);
	});
});
