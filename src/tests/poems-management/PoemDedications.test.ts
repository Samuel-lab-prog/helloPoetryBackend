import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@Prisma/ClearDatabase';

import {
	createPoem,
	getMyPoems,
	updatePoem,
	makePoem,
	makeUpdatedPoem,
	updateUserStatsRaw,
	createDraftPoem,
	type AuthUser,
} from '../endpoints/Index';

import type {
	CreatePoemResult,
	MyPoem,
	UpdatePoemResult,
} from '@Domains/poems-management/use-cases/Models';

import { expectAppError, NON_EXISTENT_ID } from '@TestUtils';

import { setupHttpUsers } from 'tests/TestsSetups.ts';

let user1: AuthUser;
let user2: AuthUser;

beforeEach(async () => {
	await clearDatabase();
	const users = await setupHttpUsers();

	if (!users[0] || !users[1])
		throw new Error('Not enough users set up for tests');

	user1 = users[0];
	user2 = users[1];
});

describe('INTEGRATION - Poems Management', () => {
	it('User can create poem with dedications', async () => {
		const poem = (await createDraftPoem(user1, {
			toUserIds: [user2.id],
		})) as CreatePoemResult;

		expect(poem.toUserIds).toContain(user2.id);
		expect(poem.toUserIds).toHaveLength(1);
		expect(poem).toHaveProperty('id');
	});

	it('User can create poem without dedications', async () => {
		const poem = (await createDraftPoem(user1)) as CreatePoemResult;
		expect(poem.toUserIds).toHaveLength(0);
	});

	it('System should not allow duplicated dedications', async () => {
		const result = await createDraftPoem(user1, {
			toUserIds: [user2.id, user2.id],
		});

		expectAppError(result, 422);
	});

	it('User cannot dedicate poem to non-existing user', async () => {
		const result = await createDraftPoem(user1, {
			toUserIds: [NON_EXISTENT_ID],
		});

		expectAppError(result, 422);
	});

	it('User cannot dedicate poem to inactive user', async () => {
		await updateUserStatsRaw(user2.id, { status: 'banned' });

		const result = await createDraftPoem(user1, {
			toUserIds: [user2.id],
		});

		expectAppError(result, 422);
	});

	it('User cannot dedicate poem to itself', async () => {
		const result = await createDraftPoem(user1, {
			toUserIds: [user1.id],
		});

		expectAppError(result, 403);
	});

	it('User can add dedications to an existing draft poem', async () => {
		const poem = (await createDraftPoem(user1)) as CreatePoemResult;

		const updatedPoem = (await updatePoem(
			user1.cookie,
			poem.id,
			makeUpdatedPoem({ toUserIds: [user2.id] }),
		)) as UpdatePoemResult;

		expect(updatedPoem.toUserIds).toContain(user2.id);
	});

	it('User can remove all dedications from a draft poem', async () => {
		const poem = (await createDraftPoem(user1, {
			toUserIds: [user2.id],
		})) as CreatePoemResult;

		const updatedPoem = (await updatePoem(
			user1.cookie,
			poem.id,
			makeUpdatedPoem({ toUserIds: [] }),
		)) as UpdatePoemResult;

		expect(updatedPoem.toUserIds).toHaveLength(0);
	});

	it('User cannot update dedications of a published poem', async () => {
		const poem = (await createPoem(
			user1.cookie,
			makePoem(user1.id, { status: 'published' }),
		)) as CreatePoemResult;

		const result = await updatePoem(
			user1.cookie,
			poem.id,
			makeUpdatedPoem({ toUserIds: [user2.id] }),
		);

		expectAppError(result, 403);
	});

	it('When fetching my poems, dedications include user info', async () => {
		const poem = (await createDraftPoem(user1, {
			toUserIds: [user2.id],
		})) as CreatePoemResult;

		const myPoems = (await getMyPoems(user1.cookie)) as MyPoem[];
		const myPoem = myPoems.find((p) => p.id === poem.id)!;

		expect(myPoem.toUsers).toHaveLength(1);
		expect(myPoem.toUsers[0]).toHaveProperty('id');
		expect(myPoem.toUsers[0]).toHaveProperty('nickname');
		expect(myPoem.toUsers[0]).toHaveProperty('friendIds');
	});
});
