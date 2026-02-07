import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

import {
	createPoem,
	getMyPoems,
	updatePoem,
	makePoem,
	makeUpdatedPoem,
} from './Utilis.ts';

import { setupHttpUsers } from 'tests/Helpers.ts';
import { updateUserStatsRaw, type TestUser } from '../Helpers.ts';
import type { MyPoem } from '@Domains/poems-management/use-cases/Models';
import type { AppError } from '@AppError';
import type {
	CreatePoem,
	CreatePoemResult,
	UpdatePoemResult,
} from '@Domains/poems-management/use-cases/Models.ts';

let users: TestUser[];
let user1: TestUser;
let user2: TestUser;

// ---------- Setup ----------
beforeEach(async () => {
	await clearDatabase();
	users = await setupHttpUsers();
	if (!users[0] || !users[1]) throw new Error('Not enough users for tests');
	[user1, user2] = users;
});

// ---------- Helpers ----------
async function createDraftPoem(
	user: TestUser,
	overrides: Partial<CreatePoem> = {},
	index = 0,
): Promise<CreatePoemResult> {
	const poemData = makePoem(user.id, { status: 'draft', ...overrides }, index);
	return (await createPoem(user, poemData)) as CreatePoemResult;
}

// ---------- Testes ----------
describe('INTEGRATION - Poems Dedications', () => {
	it('User can create poem with dedications', async () => {
		const poem = await createDraftPoem(user1, { toUserIds: [user2.id] });
		expect(poem.toUserIds).toEqual(expect.arrayContaining([user2.id]));
	});

	it('User can create poem without dedications', async () => {
		const poem = await createDraftPoem(user1);
		expect(poem.toUserIds).toHaveLength(0);
	});

	it('User can add dedications to an existing draft poem', async () => {
		const poem = await createDraftPoem(user1);
		const updated = (await updatePoem(
			user1,
			poem.id,
			makeUpdatedPoem({ toUserIds: [user2.id] }),
		)) as UpdatePoemResult;

		expect(updated.toUserIds).toHaveLength(1);
		expect(updated.toUserIds).toContain(user2.id);
	});

	it('User can remove all dedications', async () => {
		const poem = await createDraftPoem(user1, { toUserIds: [user2.id] });
		const updated = (await updatePoem(
			user1,
			poem.id,
			makeUpdatedPoem({ toUserIds: [] }),
		)) as UpdatePoemResult;

		expect(updated.toUserIds).toHaveLength(0);
	});

	it('System should not duplicate dedications', async () => {
		const result = await createDraftPoem(user1, {
			toUserIds: [user2.id, user2.id],
		});
		expect((result as unknown as AppError).statusCode).toBe(422);
	});

	it('User cannot update dedications of a published poem', async () => {
		const poem = await createDraftPoem(user1, { status: 'published' });
		const result = await updatePoem(
			user1,
			poem.id,
			makeUpdatedPoem({ toUserIds: [user2.id] }),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it('User cannot dedicate poem to non-existing user', async () => {
		const result = await createDraftPoem(user1, { toUserIds: [999999] });
		expect((result as unknown as AppError).statusCode).toBe(404);
	});

	it('User cannot dedicate poem to inactive user', async () => {
		await updateUserStatsRaw(user2.id, { status: 'banned' });
		const result = await createDraftPoem(user1, { toUserIds: [user2.id] });
		expect((result as unknown as AppError).statusCode).toBe(404);
	});

	it('User cannot dedicate a poem to itself', async () => {
		const result = await createDraftPoem(user1, { toUserIds: [user1.id] });
		expect((result as unknown as AppError).statusCode).toBe(403);
	});

	it('When fetching myPoems, dedications contains more info about dedicated users', async () => {
		const poem = await createDraftPoem(user1, { toUserIds: [user2.id] });
		const myPoems = (await getMyPoems(user1)) as MyPoem[];
		const myPoem = myPoems.find((p) => p.id === poem.id)!;

		expect(myPoem.toUsers).toHaveLength(1);
		expect(myPoem.toUsers[0]).toHaveProperty('id');
		expect(myPoem.toUsers[0]).toHaveProperty('nickname');
		expect(myPoem.toUsers[0]).toHaveProperty('friendIds');
	});
});
