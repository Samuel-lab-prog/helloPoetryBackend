import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { getPoemFactory } from './execute';

import { PoemNotFoundError, PoemAccessDeniedError } from '../errors';

describe('USE-CASE - Get Poem By Id', () => {
	let poemQueriesRepository: any;
	let getPoem: any;

	beforeEach(() => {
		poemQueriesRepository = {
			selectPoemById: mock(),
		};

		getPoem = getPoemFactory({
			poemQueriesRepository,
		});
	});

	it('Does not allow access when poem does not exist', () => {
		poemQueriesRepository.selectPoemById.mockResolvedValue(null);

		expect(
			getPoem({
				requesterId: 1,
				requesterRole: 'user',
				requesterStatus: 'active',
				poemId: 10,
			}),
		).rejects.toBeInstanceOf(PoemNotFoundError);
	});

	it('Does not allow access when viewer cannot view poem', () => {
		const poem = {
			id: 10,
			status: 'published',
			visibility: 'private',
			author: {
				id: 2,
				friendsIds: [],
			},
		};

		poemQueriesRepository.selectPoemById.mockResolvedValue(poem);

		expect(
			getPoem({
				requesterId: 1,
				requesterRole: 'user',
				requesterStatus: 'active',
				poemId: 10,
			}),
		).rejects.toBeInstanceOf(PoemAccessDeniedError);
	});
});
