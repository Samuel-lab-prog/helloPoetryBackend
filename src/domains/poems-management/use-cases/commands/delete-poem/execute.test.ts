import { describe, it, expect } from 'bun:test';
import { expectError } from '@GenericSubdomains/utils/testUtils';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - DeletePoem', () => {
	describe('Successful execution', () => {
		it('should delete a poem', async () => {
			const scenario = makePoemsScenario()
				.withUser({ id: 1 })
				.withPoemDeleted();

			const result = await scenario.executeDeletePoem({
				poemId: 1,
			});

			expect(result).toBeUndefined();
		});

		it('should call deletePoem with correct params', async () => {
			const scenario = makePoemsScenario()
				.withUser({ id: 1 })
				.withPoemDeleted();

			await scenario.executeDeletePoem({
				poemId: 1,
			});

			expect(scenario.mocks.commandsRepository.deletePoem).toHaveBeenCalledWith(
				1,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makePoemsScenario()
				.withPoem({ author: { id: 1 }, status: 'draft' })
				.withSlug('updated-title');

			scenario.mocks.commandsRepository.deletePoem.mockResolvedValue({
				ok: false,
				error: new Error('boom'),
				data: null,
				code: 'UNKNOWN',
			});

			await expectError(scenario.executeDeletePoem(), Error);
		});

		it('should propagate query dependency errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectPoemById.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeDeletePoem(), Error);
		});
	});
});
