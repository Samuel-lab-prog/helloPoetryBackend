import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

import {
	createPoem,
	getMyPoems,
	updatePoem,
	makePoem,
	makeUpdatedPoem,
} from './Helpers.ts';
import { testUsersData } from './Data.ts';

import {
	type TestUser,
	createUser,
	loginUser,
	updateUserStatsRaw,
} from '../Helpers.ts';

import type {
	CreatePoemResult,
	UpdatePoemResult,
} from '@Domains/poems-management/use-cases/commands/Models';
import type {
	AuthorPoem,
	MyPoem,
} from '@Domains/poems-management/use-cases/queries/Models';
import type { AppError } from '@AppError';

let author: TestUser;
let userA: TestUser;
let userB: TestUser;
let userC: TestUser;

beforeEach(async () => {
	await clearDatabase();

	author = await loginUser(await createUser(testUsersData[0]!));
	userA = await loginUser(await createUser(testUsersData[1]!));
	userB = await loginUser(await createUser(testUsersData[2]!));
	userC = await loginUser(await createUser(testUsersData[3]!));
});

describe('INTEGRATION - Poems Management', () => {
	it('User can create poem with dedications', async () => {
		const result = await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [userA.id, userB.id],
			}),
		);

		const poem = result as CreatePoemResult;

		expect(poem.toUserIds).toEqual(
			expect.arrayContaining([userA.id, userB.id]),
		);
	});

	it('User can create poem without dedications', async () => {
		const result = await createPoem(author, makePoem(author.id));

		const poem = result as CreatePoemResult;

		expect(poem.toUserIds).toBeArrayOfSize(0);
	});

	it('User can add dedications to an existing draft poem', async () => {
		const created = (await createPoem(
			author,
			makePoem(author.id),
		)) as AuthorPoem;

		const updated = (await updatePoem(
			author,
			created.id,
			makeUpdatedPoem({
				toUserIds: [userA.id, userB.id],
			}),
		)) as UpdatePoemResult;
		expect(updated.toUserIds).toBeArrayOfSize(2);
	});

	it('User can replace all dedications', async () => {
		const created = (await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [userA.id, userB.id],
			}),
		)) as AuthorPoem;

		const updated = (await updatePoem(
			author,
			created.id,
			makeUpdatedPoem({
				toUserIds: [userC.id],
			}),
		)) as UpdatePoemResult;

		expect(updated.toUserIds).toEqual([userC.id]);
	});

	it('User can remove all dedications', async () => {
		const created = (await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [userA.id, userB.id],
			}),
		)) as UpdatePoemResult;

		const updated = (await updatePoem(
			author,
			created.id,
			makeUpdatedPoem({
				toUserIds: [],
			}),
		)) as UpdatePoemResult;

		expect(updated.toUserIds).toBeArrayOfSize(0);
	});

	it('System should not duplicate dedications', async () => {
		const result = await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [userA.id, userA.id],
			}),
		);

		const poem = result as CreatePoemResult;
		expect((poem as unknown as AppError).statusCode).toBe(422);
	});

	it('User cannot update dedications of a published poem', async () => {
		const created = (await createPoem(
			author,
			makePoem(author.id, {
				status: 'published',
			}),
		)) as AuthorPoem;

		const result = await updatePoem(
			author,
			created.id,
			makeUpdatedPoem({
				toUserIds: [userA.id],
			}),
		);

		expect((result as AppError).statusCode).toBe(403);
	});

	it('User cannot dedicate poem to non-existing user', async () => {
		const result = await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [999999],
			}),
		);
		expect((result as AppError).statusCode).toBe(404);
	});

	it('User cannot dedicate poem to inactive user', async () => {
		await updateUserStatsRaw(userA.id, { status: 'banned' });
		const result = await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [userA.id],
			}),
		);
		expect((result as AppError).statusCode).toBe(404);
	});

	it('User cannot dedicate a poem to itself', async () => {
		const result = await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [author.id],
			}),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it('When fetching myPoems, dedications contains more info about dedicated users', async () => {
		const created = (await createPoem(
			author,
			makePoem(author.id, {
				toUserIds: [userA.id, userB.id],
			}),
		)) as AuthorPoem;
		const myPoems = (await getMyPoems(author)) as MyPoem[];
		const myPoem = myPoems.find((p) => p.id === created.id)!;

		expect(myPoem.toUsers).toBeArrayOfSize(2);
		expect(myPoem.toUsers[0]).toHaveProperty('id');
		expect(myPoem.toUsers[0]).toHaveProperty('nickname');
		expect(myPoem.toUsers[0]).toHaveProperty('friendIds');
		expect(myPoem.toUsers[1]).toHaveProperty('id');
		expect(myPoem.toUsers[1]).toHaveProperty('nickname');
		expect(myPoem.toUsers[1]).toHaveProperty('friendIds');
	});
});
