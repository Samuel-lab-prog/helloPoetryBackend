import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

import {
	createPoem,
	getAuthorPoems,
	getMyPoems,
	getPoemById,
} from './Helpers.ts';

import { testUsersData, testPoemsData } from './Data.ts';

import {
	type TestUser,
	createUser,
	loginUser,
	createFriendshipRaw,
	updatePoemRaw,
	updateUserStatsRaw,
} from '../Helpers.ts';

import type { CreatePoem } from '@Domains/poems-management/use-cases/commands/models/CreatePoem.ts';
import type { AppError } from '@AppError';
import type { AuthorPoem } from '@Domains/poems-management/use-cases/queries/Index.ts';
import type { PoemInsertResult } from '@Domains/poems-management/use-cases/commands/models/PoemInsertResult.ts';

/* -------------------------------------------------------------------------- */
/*                                   Setup                                    */
/* -------------------------------------------------------------------------- */

let author: TestUser;
let otherUser: TestUser;
let moderator: TestUser;

beforeEach(async () => {
	await clearDatabase();

	author = await createUser(testUsersData[0]!);
	otherUser = await createUser(testUsersData[1]!);
	moderator = await createUser(testUsersData[2]!);

	author = await loginUser(author);
	otherUser = await loginUser(otherUser);
	moderator = await loginUser(moderator);
});

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function basePoem(overrides: Partial<CreatePoem> = {}): CreatePoem {
	return {
		...testPoemsData[0]!,
		authorId: author.id,
		status: 'published',
		...overrides,
	};
}

async function createAndApprovePoem(
	author: TestUser,
	data: CreatePoem,
): Promise<PoemInsertResult> {
	const poem = (await createPoem(author, data)) as PoemInsertResult;
	await updatePoemRaw(poem.id!, { moderationStatus: 'approved' });
	return poem;
}

function expectForbidden(result: unknown) {
	expect((result as AppError).statusCode).toBe(403);
}

async function expectVisible(user: TestUser, poemId: number) {
	const res = await getPoemById(user, poemId);
	expect((res as any).id).toBe(poemId);
}

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

describe('INTEGRATION - Poems Management', () => {
	it('Author can always see all his poems regardless of their visibility status', async () => {
		await createPoem(author, basePoem({ visibility: 'private' }));
		await createPoem(author, basePoem({ visibility: 'unlisted' }));
		await createPoem(author, basePoem({ visibility: 'public' }));

		const poems = await getMyPoems(author);
		expect((poems as any[]).length).toBe(3);
	});

	it('Private poems are only visible to author', async () => {
		const poem = await createAndApprovePoem(
			author,
			basePoem({ visibility: 'private' }),
		);

		expectForbidden(await getPoemById(otherUser, poem.id!));
		await expectVisible(author, poem.id!);
	});

	it('Friends-only poems are visible only to author and friends', async () => {
		const poem = await createAndApprovePoem(
			author,
			basePoem({ visibility: 'friends' }),
		);

		expectForbidden(await getPoemById(otherUser, poem.id!));

		await createFriendshipRaw(author.id, otherUser.id);

		await expectVisible(otherUser, poem.id!);
	});

	it('Unlisted poems are accessible only by direct link', async () => {
		const poem = await createAndApprovePoem(
			author,
			basePoem({ visibility: 'unlisted' }),
		);

		await expectVisible(otherUser, poem.id!);

		const list = await getAuthorPoems(otherUser, author.id);
		expect((list as any[]).length).toBe(0);
	});

	it('Public poems are visible to everyone', async () => {
		const poem = await createAndApprovePoem(
			author,
			basePoem({ visibility: 'public' }),
		);

		await expectVisible(otherUser, poem.id!);

		const list = await getAuthorPoems(otherUser, author.id);
		expect((list as any[]).length).toBe(1);
	});

	it('Moderators cannot see private poems', async () => {
		const poem = await createAndApprovePoem(
			author,
			basePoem({ visibility: 'private' }),
		);

		expectForbidden(await getPoemById(moderator, poem.id!));
	});

	it('Draft poems are only visible to author', async () => {
		const poem = (await createPoem(
			author,
			basePoem({ status: 'draft', visibility: 'public' }),
		)) as PoemInsertResult;

		await updatePoemRaw(poem.id!, { moderationStatus: 'approved' });

		expectForbidden(await getPoemById(otherUser, poem.id!));
	});

	it('Unapproved poems are only visible to author', async () => {
		const poem = (await createPoem(
			author,
			basePoem({ visibility: 'public' }),
		)) as PoemInsertResult;

		expectForbidden(await getPoemById(otherUser, poem.id!));

		const fetchedByAuthor = await getPoemById(author, poem.id!);
		expect((fetchedByAuthor as any).content).toBe(poem.id);
	});

	it('Banned users cannot see poems', async () => {
		const poem = await createAndApprovePoem(
			author,
			basePoem({ visibility: 'public' }),
		);

		await updateUserStatsRaw(otherUser.id, { status: 'banned' });

		const bannedUser = await loginUser(otherUser);

		expectForbidden(await getPoemById(bannedUser, poem.id!));
	});
});
