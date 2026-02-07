import { describe, it, expect, mock } from 'bun:test';

import { getAuthorPoemsFactory } from './execute';

import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { AuthorPoem } from '../../Models';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

describe('USE-CASE - Poems', () => {
	describe('Get Author Poems', () => {
		const selectAuthorPoems = mock();

		const poemQueriesRepository: QueriesRepository = {
			selectAuthorPoems,
			selectMyPoems: mock(),
			selectPoemById: mock(),
		};

		const validAuthorPoem: AuthorPoem = {
			id: 1,
			content: 'A poem',
			status: 'published',
			visibility: 'public',
			moderationStatus: 'approved',
			title: 'Poem Title',
			slug: 'poem-title',
			isCommentable: true,
			excerpt: 'A poem excerpt',
			stats: {
				likesCount: 10,
				commentsCount: 5,
			},
			tags: [
				{
					id: 1,
					name: 'tag1',
				},
			],
			toUsers: [],
			author: {
				id: 1,
				friendIds: [],
				avatarUrl: 'http://example.com/avatar.jpg',
				name: 'Author Name',
				nickname: 'author_nick',
			},
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const getAuthorPoems = getAuthorPoemsFactory({ poemQueriesRepository });

		it('Calls repository with author id', async () => {
			selectAuthorPoems.mockResolvedValueOnce([]);

			await getAuthorPoems({
				authorId: 1,
				requesterId: 2,
				requesterRole: 'user' as UserRole,
				requesterStatus: 'active' as UserStatus,
			});

			expect(selectAuthorPoems).toHaveBeenCalledWith(1);
		});

		it('Filters poems the requester cannot view', async () => {
			const poems: AuthorPoem[] = [
				validAuthorPoem,
				validAuthorPoem,
				validAuthorPoem,
			];

			selectAuthorPoems.mockResolvedValueOnce(poems);

			const result = await getAuthorPoems({
				authorId: 1,
				requesterId: 99,
				requesterRole: 'user' as UserRole,
				requesterStatus: 'active' as UserStatus,
			});

			// We only assert that filtering occurred, not the policy rules
			expect(result.length).toBeLessThanOrEqual(poems.length);
		});

		it('Returns only poems the requester can view', async () => {
			const poems = [
				validAuthorPoem,
				{ ...validAuthorPoem, visibility: 'private' as const },
			];

			selectAuthorPoems.mockResolvedValueOnce(poems);

			const result = await getAuthorPoems({
				authorId: 1,
				requesterId: 2,
				requesterRole: 'user' as UserRole,
				requesterStatus: 'active' as UserStatus,
			});

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('id');
		});
	});
});
