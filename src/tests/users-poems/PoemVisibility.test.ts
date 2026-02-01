import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import { createPoem } from './Helpers.ts';
import {
	type TestUser,
	createUser,
	loginUser,
	updateUserStats,
} from '../Helpers.ts';
import type { InsertPoem } from '@Domains/poems-management/use-cases/commands/models/InsertPoem';
import type { AppError } from '@AppError';

let author: TestUser;
let otherUser: TestUser;
let moderator: TestUser;

beforeEach(async () => {
	await clearDatabase();

	author = await createUser({
		email: 'author@example.com',
		password: 'password',
		nickname: 'author',
		name: 'Author One',
		bio: 'Bio author',
		avatarUrl: 'http://example.com/avatar.png',
	});
	otherUser = await createUser({
		email: 'other@example.com',
		password: 'password',
		nickname: 'other',
		name: 'Other User',
		bio: 'Bio other',
		avatarUrl: 'http://example.com/avatar2.png',
	});
	moderator = await createUser({
		email: 'mod@example.com',
		password: 'password',
		nickname: 'mod',
		name: 'Moderator',
		bio: 'Bio moderator',
		avatarUrl: 'http://example.com/mod.png',
	});

	await updateUserStats(moderator.id, { role: 'moderator', status: 'active' });
	await updateUserStats(author.id, { role: 'author', status: 'active' });

	author = await loginUser(author);
	otherUser = await loginUser(otherUser);
	moderator = await loginUser(moderator);
});

describe('INTEGRATION - Poems Management', () => {
	it('Author can create a poem with valid data', async () => {
		const poemData: InsertPoem = {
			title: 'My First Poem',
			content: 'This is a poem.',
			slug: 'my-first-poem',
			excerpt: 'Short excerpt',
			authorId: author.id,
			tags: ['life', 'love'],
		};
		const poem = (await createPoem(author, poemData)) as { id: number };
		expect(poem.id).toBeDefined();
	});

	it('Cannot create a poem with empty title or content', async () => {
		const poemData: InsertPoem = {
			title: '',
			content: '',
			slug: 'empty-poem',
			excerpt: null,
			authorId: author.id,
		};
		const result = await createPoem(author, poemData);
		expect((result as AppError).statusCode).toBe(422);
	});
});
