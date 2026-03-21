import { describe, it, expect } from 'bun:test';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import { expectError } from '@GenericSubdomains/utils/TestUtils';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - ModeratePoem', () => {
	describe('Successful execution', () => {
		it('should update poem moderation status', async () => {
			const scenario = makePoemsScenario()
				.withPoem({ moderationStatus: 'pending' })
				.withModeratedPoem({ id: 12, moderationStatus: 'approved' });

			const result = await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'approved',
			});

			expect(result).toHaveProperty('id', 12);
			expect(
				scenario.mocks.commandsRepository.updatePoemModerationStatus,
			).toHaveBeenCalledWith({
				poemId: 1,
				moderationStatus: 'approved',
			});
		});
	});

	describe('Permissions', () => {
		it('should throw ForbiddenError when requester is not moderator/admin', async () => {
			const scenario = makePoemsScenario().withPoem();

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'author',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});

		it('should throw ForbiddenError when requester is not active', async () => {
			const scenario = makePoemsScenario().withPoem();

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterStatus: 'banned',
						requesterRole: 'moderator',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});
	});

	describe('Validation', () => {
		it('should throw ForbiddenError for invalid moderation status', async () => {
			const scenario = makePoemsScenario().withPoem();

			await expectError(
				scenario.executeModeratePoem({
					moderationStatus: 'invalid-status' as never,
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});

		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makePoemsScenario().withPoemNotFound();

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				NotFoundError,
			);
		});

		it('should throw ForbiddenError when poem is removed', async () => {
			const scenario = makePoemsScenario().withPoem({
				moderationStatus: 'removed',
			});

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makePoemsScenario().withPoem();

			scenario.mocks.commandsRepository.updatePoemModerationStatus.mockResolvedValue(
				{
					ok: false,
					data: null,
					error: new Error('boom'),
					code: 'UNKNOWN',
				},
			);

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				Error,
			);
		});
	});
});
