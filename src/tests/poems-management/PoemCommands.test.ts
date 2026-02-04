import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

import {
	createPoem,
	getMyPoems,
	updatePoem,
	makePoem,
	makeUpdatedPoem,
} from './Helpers.ts';

import { testUsersData, testPoemsData } from './Data.ts';

import {
	type TestUser,
	createUser,
	loginUser,
	updateUserStatsRaw,
} from '../Helpers.ts';

import type { AppError } from '@AppError';
import type { AuthorPoem } from '@Domains/poems-management/use-cases/queries/Models';

let author: TestUser;
let otherUser: TestUser;
let thirdUser: TestUser;

beforeEach(async () => {
	await clearDatabase();

	author = await createUser(testUsersData[0]!);
	otherUser = await createUser(testUsersData[1]!);
	thirdUser = await createUser(testUsersData[2]!);

	author = await loginUser(author);
	otherUser = await loginUser(otherUser);
	thirdUser = await loginUser(thirdUser);
});

describe('INTEGRATION - Poems Management', () => {
	it('User should be able to create a poem', async () => {
		const _createdPoem = await createPoem(
			author,
			makePoem(author.id, { visibility: 'private' }, 0),
		);
		const myPoems = (await getMyPoems(author)) as AuthorPoem[];
		expect(myPoems.length).toBe(1);
		expect(myPoems[0]!.title).toBe(testPoemsData[0]!.title);
	});

	it('Default visibility for a poem is public', async () => {
		await createPoem(author, makePoem(author.id, {}, 1));
		const myPoems = (await getMyPoems(author)) as AuthorPoem[];
		expect(myPoems[0]!.visibility).toBe('public');
	});

	it('Default moderation status for a poem is pending', async () => {
		await createPoem(author, makePoem(author.id, {}, 2));
		const myPoems = (await getMyPoems(author)) as AuthorPoem[];
		expect(myPoems[0]!.moderationStatus).toBe('pending');
	});

	it('Default status for a poem is draft', async () => {
		await createPoem(author, makePoem(author.id, {}, 0));
		const myPoems = (await getMyPoems(author)) as AuthorPoem[];
		expect(myPoems[0]!.status).toBe('draft');
	});

	it('User cannot have two poems with the same title', async () => {
		await createPoem(author, makePoem(author.id, {}, 0));
		const result = await createPoem(author, makePoem(author.id, {}, 0));
		expect((result as AppError).statusCode).toBe(409);
	});

	it('Different users can have poems with the same title', async () => {
		await createPoem(author, makePoem(author.id, {}, 0));
		const result = await createPoem(otherUser, makePoem(otherUser.id, {}, 0));
		expect((result as AuthorPoem).title).toBe(testPoemsData[0]!.title);
	});

	it('User cannot update poem once is published', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'published' }, 1),
		)) as AuthorPoem;
		const result = await updatePoem(
			author,
			createdPoem.id,
			makeUpdatedPoem({ title: 'New Title' }, 1),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it('User can update the poem if it is in draft status', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft' }, 2),
		)) as AuthorPoem;
		const updatedPoemData = makeUpdatedPoem({ title: 'Updated Poem Title' }, 2);
		const updatedPoem = (await updatePoem(
			author,
			createdPoem.id,
			updatedPoemData,
		)) as AuthorPoem;
		expect(updatedPoem.title).toBe(updatedPoemData.title);
	});

	it('Banned user cannot create a poem', async () => {
		await updateUserStatsRaw(otherUser.id, { status: 'banned' });
		const loggedBannedUser = await loginUser(otherUser);
		const result = await createPoem(
			loggedBannedUser,
			makePoem(loggedBannedUser.id, {}, 0),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it('Banned user cannot update a poem', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft' }, 0),
		)) as AuthorPoem;
		await updateUserStatsRaw(author.id, { status: 'banned' });
		const loggedBannedUser = await loginUser(author);
		const result = await updatePoem(
			loggedBannedUser,
			createdPoem.id,
			makeUpdatedPoem({ title: 'New Title' }, 0),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it('Suspended user cannot update a poem', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft' }, 0),
		)) as AuthorPoem;
		await updateUserStatsRaw(author.id, { status: 'suspended' });
		const loggedSuspendedUser = await loginUser(author);
		const result = await updatePoem(
			loggedSuspendedUser,
			createdPoem.id,
			makeUpdatedPoem({ title: 'New Title' }, 0),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it('Suspended user cannot create a poem', async () => {
		await updateUserStatsRaw(otherUser.id, { status: 'suspended' });
		const loggedSuspendedUser = await loginUser(otherUser);
		const result = await createPoem(
			loggedSuspendedUser,
			makePoem(loggedSuspendedUser.id, {}, 0),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it("User cannot update another user's poem", async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft' }, 1),
		)) as AuthorPoem;
		const result = await updatePoem(
			otherUser,
			createdPoem.id,
			makeUpdatedPoem({ title: 'Hacked Title' }, 1),
		);
		expect((result as AppError).statusCode).toBe(403);
	});

	it('Conflict may occur if updating to a title that another poem by the same user has', async () => {
		(await createPoem(
			author,
			makePoem(author.id, { title: 'First Title', status: 'draft' }, 0),
		)) as AuthorPoem;
		const secondPoem = (await createPoem(
			author,
			makePoem(author.id, { title: 'Second Title', status: 'draft' }, 1),
		)) as AuthorPoem;
		const result = await updatePoem(
			author,
			secondPoem.id,
			makeUpdatedPoem({ title: 'First Title' }, 1),
		);
		expect((result as AppError).statusCode).toBe(409);
	});

	it('User can update poem without changing any field', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft' }, 0),
		)) as AuthorPoem;

		const result = await updatePoem(
			author,
			createdPoem.id,
			makeUpdatedPoem({ title: createdPoem.title }, 0),
		);

		expect((result as AuthorPoem).title).toBe(createdPoem.title);
	});

	it('User can update tags of a draft poem', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft', tags: ['old'] }, 0),
		)) as AuthorPoem;

		const updatedData = makeUpdatedPoem({ tags: ['new1', 'new2'] }, 0);

		const updatedPoem = (await updatePoem(
			author,
			createdPoem.id,
			updatedData,
		)) as AuthorPoem;

		expect(updatedPoem.tags).toBeArray();
	});

	it('User can update multiple fields of a draft poem', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft', tags: ['old'] }, 0),
		)) as AuthorPoem;

		const updatedData = makeUpdatedPoem(
			{
				title: 'Completely New Title',
				content: 'New content',
				excerpt: 'New excerpt',
				tags: ['newtag1', 'newtag2'],
				visibility: 'private',
			},
			0,
		);

		const updatedPoem = (await updatePoem(
			author,
			createdPoem.id,
			updatedData,
		)) as AuthorPoem;

		expect(updatedPoem.title).toBe(updatedData.title);
		expect(updatedPoem.content).toBe(updatedData.content);
		expect(updatedPoem.tags).toBeArray();
		expect(updatedPoem.visibility).toBe('private');
	});

	it('User cannot update a non-existing poem', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft' }, 1),
		)) as AuthorPoem;
		const result = await updatePoem(
			author,
			createdPoem.id + 999,
			makeUpdatedPoem({ title: 'New Title' }, 1),
		);
		expect((result as AppError).statusCode).toBe(404);
	});

	it('User cannot update a poem after being banned', async () => {
		const createdPoem = (await createPoem(
			author,
			makePoem(author.id, { status: 'draft' }, 1),
		)) as AuthorPoem;
		await updateUserStatsRaw(author.id, { status: 'banned' });
		const result = await updatePoem(
			author,
			createdPoem.id,
			makeUpdatedPoem({ title: 'New Title' }, 1),
		);
		expect((result as AppError).statusCode).toBe(403);
	});
});
