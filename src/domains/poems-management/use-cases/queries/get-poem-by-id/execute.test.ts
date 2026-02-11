import { describe, it, expect, mock } from 'bun:test';

import { getPoemFactory } from './execute';
import { PoemNotFoundError } from '../../Errors';

import type { QueriesRepository } from '../../../ports/Queries';
import type { AuthorPoem } from '../../Models';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

describe('USE-CASE - Poems Management', () => {
	describe('Get Poem', () => {
		const selectPoemById = mock();

		const poemQueriesRepository: QueriesRepository = {
			selectPoemById,
			selectMyPoems: mock(),
			selectAuthorPoems: mock(),
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

		const getPoem = getPoemFactory({ poemQueriesRepository });

		it('Throws PoemNotFoundError when poem does not exist', () => {
			selectPoemById.mockResolvedValueOnce(null);

			const promise = getPoem({
				poemId: 1,
				requesterId: 10,
				requesterRole: 'user' as UserRole,
				requesterStatus: 'active' as UserStatus,
			});

			expect(promise).rejects.toThrow(PoemNotFoundError);
		});

		it('Returns the poem when access is allowed', async () => {
			const poem = { ...validAuthorPoem, visibility: 'public' as const };

			selectPoemById.mockResolvedValueOnce(poem);

			const result = await getPoem({
				poemId: 1,
				requesterId: 10,
				requesterRole: 'user' as UserRole,
				requesterStatus: 'active' as UserStatus,
			});

			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('content', poem.content);
		});
	});
});
