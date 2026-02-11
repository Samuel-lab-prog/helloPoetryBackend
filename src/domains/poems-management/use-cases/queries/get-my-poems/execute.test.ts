import { describe, it, expect, mock } from 'bun:test';
import { getMyPoemsFactory } from './execute';
import type { QueriesRepository } from '../../../ports/Queries';

describe('USE-CASE - Poems Management', () => {
	describe('Get My Poems', () => {
		const selectMyPoems = mock();

		const poemQueriesRepository: QueriesRepository = {
			selectMyPoems,
			selectAuthorPoems: mock(),
			selectPoemById: mock(),
		};

		const getMyPoems = getMyPoemsFactory({ poemQueriesRepository });

		it('Calls repository with requester id', async () => {
			selectMyPoems.mockResolvedValueOnce([]);

			await getMyPoems({ requesterId: 1 });

			expect(selectMyPoems).toHaveBeenCalledWith(1);
		});
	});
});
