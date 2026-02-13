import { describe, it, expect, beforeEach } from 'bun:test';
import { clearDatabase } from '@Prisma/ClearDatabase';

import {
	createPoem,
	updatePoem,
	makePoem,
	makeUpdatedPoem,
	updateUserStatsRaw,
	createDraftPoem,
	getMyFirstPoem,
	type AuthUser,
} from '../endpoints/Index';

import { poemsData } from '../data/Index';
import type {
	CreatePoemResult,
	UpdatePoem,
	UpdatePoemResult,
} from '@Domains/poems-management/use-cases/Models';
import { expectAppError, NON_EXISTENT_ID } from '@TestUtils';

import { setupHttpUsers } from 'tests/TestsSetups.ts';

let user1: AuthUser;
let user2: AuthUser;

beforeEach(async () => {
	await clearDatabase();

	const users = await setupHttpUsers();
	const [u1, u2] = users;

	if (!u1 || !u2) throw new Error('Not enough users set up for tests');

	user1 = u1;
	user2 = u2;
});

describe('INTEGRATION - Poems Management', () => {
	it('User should be able to create a poem', async () => {
		await createDraftPoem(user1);
		const poem = await getMyFirstPoem(user1.cookie);
		expect(poem.title).toBe(poemsData[0]!.title);
	});

	it('Default visibility for a poem is public', async () => {
		await createDraftPoem(user1);
		const poem = await getMyFirstPoem(user1.cookie);

		expect(poem.visibility).toBe('public');
	});

	it('Default moderation status for a poem is pending', async () => {
		await createDraftPoem(user1);
		const poem = await getMyFirstPoem(user1.cookie);

		expect(poem.moderationStatus).toBe('pending');
	});

	it('Default status for a poem is draft', async () => {
		await createDraftPoem(user1);
		const poem = await getMyFirstPoem(user1.cookie);

		expect(poem.status).toBe('draft');
	});

	it('User cannot have two poems with the same title', async () => {
		await createPoem(user1.cookie, makePoem(user1.id, {}, 0));
		const result = await createPoem(user1.cookie, makePoem(user1.id, {}, 0));

		expectAppError(result, 409);
	});

	it('Different users can have poems with the same title', async () => {
		await createDraftPoem(user1);
		const result = (await createDraftPoem(user2)) as CreatePoemResult;

		expect(result.title).toBe(poemsData[0]!.title);
	});

	it('User cannot update poem once it is published', async () => {
		const createdPoem = (await createPoem(
			user1.cookie,
			makePoem(user1.id, { status: 'published' }),
		)) as CreatePoemResult;

		const result = await updatePoem(
			user1.cookie,
			createdPoem.id,
			makeUpdatedPoem({ title: 'New Title' }),
		);

		expectAppError(result, 403);
	});

	it('User can update the poem if it is in draft status', async () => {
		const createdPoem = (await createDraftPoem(user1)) as CreatePoemResult;
		const updatedData = makeUpdatedPoem({ title: 'Updated Poem Title' }, 2);

		const updatedPoem = (await updatePoem(
			user1.cookie,
			createdPoem.id,
			updatedData,
		)) as CreatePoemResult;

		expect(updatedPoem.title).toBe(updatedData.title);
	});

	it("User cannot update another user's poem", async () => {
		const poem = (await createDraftPoem(user1)) as CreatePoemResult;
		const result = await updatePoem(
			user2.cookie,
			poem.id,
			makeUpdatedPoem({ title: 'Hacked Title' }),
		);

		expectAppError(result, 403);
	});

	it('Conflict may occur if updating to a title that another poem by the same user has', async () => {
		(await createDraftPoem(
			user1,
			{ title: 'First Title' },
			0,
		)) as CreatePoemResult;
		const secondPoem = (await createDraftPoem(
			user1,
			{ title: 'Second Title' },
			1,
		)) as CreatePoemResult;

		const result = await updatePoem(
			user1.cookie,
			secondPoem.id,
			makeUpdatedPoem({ title: 'First Title' }, 1),
		);

		expectAppError(result, 409);
	});

	it('User can update poem without changing any field', async () => {
		const poem = (await createDraftPoem(user2)) as CreatePoemResult;
		const result = (await updatePoem(
			user2.cookie,
			poem.id,
			makeUpdatedPoem({ title: poem.title }),
		)) as UpdatePoemResult;

		expect(result.title).toBe(poem.title);
	});

	it('User can update tags of a draft poem', async () => {
		const poem = (await createDraftPoem(user2, {
			tags: ['old'],
		})) as CreatePoemResult;
		const updatedData = makeUpdatedPoem({
			tags: ['new1', 'new2'],
		}) as UpdatePoem;

		const updatedPoem = (await updatePoem(
			user2.cookie,
			poem.id,
			updatedData,
		)) as UpdatePoemResult;

		expect(updatedPoem.tags).toBeArray();
	});

	it('User can update multiple fields of a draft poem', async () => {
		const poem = (await createDraftPoem(user2, {
			tags: ['old'],
		})) as CreatePoemResult;
		const updatedData = makeUpdatedPoem({
			title: 'Completely New Title',
			content: 'New content',
			excerpt: 'New excerpt',
			tags: ['newtag1', 'newtag2'],
			visibility: 'private',
		});

		const updatedPoem = (await updatePoem(
			user2.cookie,
			poem.id,
			updatedData,
		)) as UpdatePoemResult;

		expect(updatedPoem.title).toBe(updatedData.title);
		expect(updatedPoem.content).toBe(updatedData.content);
		expect(updatedPoem.tags).toBeArray();
		expect(updatedPoem.visibility).toBe('private');
	});

	it('User cannot update a non-existing poem', async () => {
		(await createDraftPoem(user1)) as CreatePoemResult;
		const result = await updatePoem(
			user1.cookie,
			NON_EXISTENT_ID,
			makeUpdatedPoem({ title: 'New Title' }),
		);

		expectAppError(result, 404);
	});

	(['banned', 'suspended'] as const).forEach((status) => {
		it(`User with status ${status} cannot create a poem`, async () => {
			await updateUserStatsRaw(user2.id, { status });
			const result = await createPoem(user2.cookie, makePoem(user2.id));

			expectAppError(result, 403);
		});

		it(`User with status ${status} cannot update a poem`, async () => {
			const poem = (await createDraftPoem(user2)) as CreatePoemResult;
			await updateUserStatsRaw(user2.id, { status });

			const result = await updatePoem(
				user2.cookie,
				poem.id,
				makeUpdatedPoem({ title: 'New Title' }),
			);

			expectAppError(result, 403);
		});
	});

	it('User cannot update a poem after being banned', async () => {
		const poem = (await createDraftPoem(user1)) as CreatePoemResult;
		await updateUserStatsRaw(user1.id, { status: 'banned' });

		const result = await updatePoem(
			user1.cookie,
			poem.id,
			makeUpdatedPoem({ title: 'New Title' }),
		);

		expectAppError(result, 403);
	});
});
