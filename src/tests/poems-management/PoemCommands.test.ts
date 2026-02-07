import { describe, it, expect, beforeEach } from 'bun:test';
import { clearDatabase } from '@ClearDatabase';
import type { AppError } from '@AppError';

import {
	createPoem,
	getMyPoems,
	updatePoem,
	makePoem,
	makeUpdatedPoem,
} from './Utilis.ts';

import { updateUserStatsRaw, type TestUser } from '../Helpers.ts';
import { setupHttpUsers } from 'tests/Helpers.ts';
import { poemsData } from '../TestsData.ts';
import type { AuthorPoem } from '@Domains/poems-management/use-cases/Models';
import type { CreatePoem } from '@Domains/poems-management/use-cases/Models.ts';

let users: TestUser[];
let user1: TestUser;
let user2: TestUser;

beforeEach(async () => {
	await clearDatabase();
	users = await setupHttpUsers();
	if (!users[0] || !users[1])
		throw new Error('Not enough users set up for tests');
	user1 = users[0];
	user2 = users[1];
});

async function createDraftPoem(
	user: TestUser,
	overrides: Partial<CreatePoem> = {},
	index = 0,
): Promise<AuthorPoem> {
	const poemData = makePoem(user.id, { status: 'draft', ...overrides }, index);
	return (await createPoem(user, poemData)) as AuthorPoem;
}

async function getFirstPoem(user: TestUser): Promise<AuthorPoem> {
	const poems = (await getMyPoems(user)) as AuthorPoem[];
	expect(poems.length).toBeGreaterThan(0);
	return poems[0]!;
}

// ---------- Testes principais ----------

describe('INTEGRATION - Poems Management', () => {
	describe('Creating poems', () => {
		it('User should be able to create a poem', async () => {
			await createDraftPoem(user1);
			const poem = await getFirstPoem(user1);

			expect(poem.title).toBe(poemsData[0]!.title);
		});

		it('Default visibility for a poem is public', async () => {
			await createDraftPoem(user1);
			const poem = await getFirstPoem(user1);

			expect(poem.visibility).toBe('public');
		});

		it('Default moderation status for a poem is pending', async () => {
			await createDraftPoem(user1);
			const poem = await getFirstPoem(user1);

			expect(poem.moderationStatus).toBe('pending');
		});

		it('Default status for a poem is draft', async () => {
			await createDraftPoem(user1);
			const poem = await getFirstPoem(user1);

			expect(poem.status).toBe('draft');
		});

		it('User cannot have two poems with the same title', async () => {
			await createPoem(user1, makePoem(user1.id, {}, 0));
			const result = await createPoem(user1, makePoem(user1.id, {}, 0));

			expect((result as AppError).statusCode).toBe(409);
		});

		it('Different users can have poems with the same title', async () => {
			await createDraftPoem(user1);
			const result = await createDraftPoem(user2);

			expect((result as AuthorPoem).title).toBe(poemsData[0]!.title);
		});
	});

	describe('Updating poems', () => {
		it('User cannot update poem once it is published', async () => {
			const createdPoem = (await createPoem(
				user1,
				makePoem(user1.id, { status: 'published' }),
			)) as AuthorPoem;

			const result = await updatePoem(
				user1,
				createdPoem.id,
				makeUpdatedPoem({ title: 'New Title' }),
			);

			expect((result as AppError).statusCode).toBe(403);
		});

		it('User can update the poem if it is in draft status', async () => {
			const createdPoem = await createDraftPoem(user1);
			const updatedData = makeUpdatedPoem({ title: 'Updated Poem Title' }, 2);

			const updatedPoem = (await updatePoem(
				user1,
				createdPoem.id,
				updatedData,
			)) as AuthorPoem;

			expect(updatedPoem.title).toBe(updatedData.title);
		});

		it("User cannot update another user's poem", async () => {
			const poem = await createDraftPoem(user1);
			const result = await updatePoem(
				user2,
				poem.id,
				makeUpdatedPoem({ title: 'Hacked Title' }),
			);

			expect((result as AppError).statusCode).toBe(403);
		});

		it('Conflict may occur if updating to a title that another poem by the same user has', async () => {
			await createDraftPoem(user1, { title: 'First Title' }, 0);
			const secondPoem = await createDraftPoem(
				user1,
				{ title: 'Second Title' },
				1,
			);

			const result = await updatePoem(
				user1,
				secondPoem.id,
				makeUpdatedPoem({ title: 'First Title' }, 1),
			);

			expect((result as AppError).statusCode).toBe(409);
		});

		it('User can update poem without changing any field', async () => {
			const poem = await createDraftPoem(user2);
			const result = (await updatePoem(
				user2,
				poem.id,
				makeUpdatedPoem({ title: poem.title }),
			)) as AuthorPoem;

			expect(result.title).toBe(poem.title);
		});

		it('User can update tags of a draft poem', async () => {
			const poem = await createDraftPoem(user2, { tags: ['old'] });
			const updatedData = makeUpdatedPoem({ tags: ['new1', 'new2'] });

			const updatedPoem = (await updatePoem(
				user2,
				poem.id,
				updatedData,
			)) as AuthorPoem;

			expect(updatedPoem.tags).toBeArray();
		});

		it('User can update multiple fields of a draft poem', async () => {
			const poem = await createDraftPoem(user2, { tags: ['old'] });
			const updatedData = makeUpdatedPoem({
				title: 'Completely New Title',
				content: 'New content',
				excerpt: 'New excerpt',
				tags: ['newtag1', 'newtag2'],
				visibility: 'private',
			});

			const updatedPoem = (await updatePoem(
				user2,
				poem.id,
				updatedData,
			)) as AuthorPoem;

			expect(updatedPoem.title).toBe(updatedData.title);
			expect(updatedPoem.content).toBe(updatedData.content);
			expect(updatedPoem.tags).toBeArray();
			expect(updatedPoem.visibility).toBe('private');
		});

		it('User cannot update a non-existing poem', async () => {
			const poem = await createDraftPoem(user1);
			const result = await updatePoem(
				user1,
				poem.id + 999,
				makeUpdatedPoem({ title: 'New Title' }),
			);

			expect((result as AppError).statusCode).toBe(404);
		});
	});

	describe('User status restrictions', () => {
		['banned', 'suspended'].forEach((status) => {
			it(`User with status ${status} cannot create a poem`, async () => {
				await updateUserStatsRaw(user2.id, { status: status as any });
				const result = await createPoem(user2, makePoem(user2.id));
				expect((result as AppError).statusCode).toBe(403);
			});

			it(`User with status ${status} cannot update a poem`, async () => {
				const poem = await createDraftPoem(user2);
				await updateUserStatsRaw(user2.id, { status: status as any });
				const result = await updatePoem(
					user2,
					poem.id,
					makeUpdatedPoem({ title: 'New Title' }),
				);
				expect((result as AppError).statusCode).toBe(403);
			});
		});

		it('User cannot update a poem after being banned', async () => {
			const poem = await createDraftPoem(user1);
			await updateUserStatsRaw(user1.id, { status: 'banned' });
			const result = await updatePoem(
				user1,
				poem.id,
				makeUpdatedPoem({ title: 'New Title' }),
			);
			expect((result as AppError).statusCode).toBe(403);
		});
	});
});
