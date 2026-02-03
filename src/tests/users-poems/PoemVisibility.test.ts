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

import type {
	CreatePoem,
	PoemCreationResult,
} from '@Domains/poems-management/use-cases/commands/Models';
import type { AuthorPoem } from '@Domains/poems-management/use-cases/queries/Models';
import type { AppError } from '@AppError';

let author: TestUser;
let otherUser: TestUser;
let thirdUser: TestUser;

/* -------------------------------------------------------------------------- */
/*                                    Helpers                                 */
/* -------------------------------------------------------------------------- */

function makePoem(
	authorId: number,
	overrides: Partial<CreatePoem> = {},
	index = 0,
): CreatePoem & { authorId: number } {
	return {
		...testPoemsData[index]!,
		authorId,
		...overrides,
	};
}

async function createAndApprovePoem(
	user: TestUser,
	poem: CreatePoem,
): Promise<PoemCreationResult> {
	const result = (await createPoem(user, poem)) as PoemCreationResult;
	await updatePoemRaw(result.id!, { moderationStatus: 'approved' });
	return result;
}

/* -------------------------------------------------------------------------- */

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
	it('Author can always see all his poems regardless of their visibility status', async () => {
		await createPoem(author, makePoem(author.id, { visibility: 'private' }, 0));
		await createPoem(
			author,
			makePoem(author.id, { visibility: 'unlisted' }, 1),
		);
		await createPoem(author, makePoem(author.id, { visibility: 'public' }, 2));

		const poems = (await getMyPoems(author)) as any[];
		expect(poems.length).toBe(3);
	});

	it('Private poems are only visible to their authors', async () => {
		const poem = makePoem(author.id, {
			visibility: 'private',
			status: 'published',
		});

		await createPoem(author, poem);

		const fetchedByOther = await getPoemById(otherUser, 1);
		expect((fetchedByOther as AppError).statusCode).toBe(403);

		const fetchedByAuthor = await getPoemById(author, 1);
		expect((fetchedByAuthor as AuthorPoem).id).toBe(1);
	});

	it('Friends-only poems are visible to author and friends', async () => {
		const poem = makePoem(author.id, {
			visibility: 'friends',
			status: 'published',
		});

		const result = (await createPoem(author, poem)) as PoemCreationResult;

		const denied = await getPoemById(otherUser, result.id!);
		expect((denied as AppError).statusCode).toBe(403);

		await updatePoemRaw(result.id!, { moderationStatus: 'approved' });
		await createFriendshipRaw(author.id, otherUser.id);

		const allowed = await getPoemById(otherUser, result.id!);
		expect((allowed as AuthorPoem).id).toBe(result.id!);
	});

	it('Unlisted poems are only accessible via direct link', async () => {
		const poem = makePoem(author.id, {
			visibility: 'unlisted',
			status: 'published',
		});

		const result = await createAndApprovePoem(author, poem);

		const fetched = await getPoemById(otherUser, result.id!);
		expect((fetched as AuthorPoem).id).toBe(result.id!);

		const listed = await getAuthorPoems(otherUser, author.id);
		expect((listed as AuthorPoem[]).length).toBe(0);
	});

	it('Public poems are visible to everyone', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});

		const result = await createAndApprovePoem(author, poem);

		const fetched = await getPoemById(otherUser, result.id!);
		expect((fetched as any).id).toBe(result.id!);

		const authorPoems = await getAuthorPoems(otherUser, author.id);
		expect((authorPoems as any[]).length).toBe(1);
	});

	it('Moderators cannot see private poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'private',
			status: 'published',
		});

		const result = await createAndApprovePoem(author, poem);

		await updateUserStatsRaw(thirdUser.id, { role: 'moderator' });
		const fetched = await getPoemById(thirdUser, result.id!);
		expect((fetched as AppError).statusCode).toBe(403);
	});

	it('Draft poems are only visible to their authors', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'draft',
		});

		const result = await createAndApprovePoem(author, poem);

		const fetched = await getPoemById(otherUser, result.id!);
		expect((fetched as AppError).statusCode).toBe(403);
	});

	it('Poems not approved by moderation are only visible to their authors', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});

		const result = (await createPoem(author, poem)) as PoemCreationResult;

		const denied = await getPoemById(otherUser, result.id!);
		expect((denied as AppError).statusCode).toBe(403);

		const fetched = await getPoemById(author, result.id!);
		expect((fetched as AuthorPoem).content).toBe(poem.content);
	});

	it('Banned users cannot see poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});

		const result = await createAndApprovePoem(author, poem);

		await updateUserStatsRaw(otherUser.id, { status: 'banned' });

		const bannedSession = await loginUser(otherUser);
		const fetched = await getPoemById(bannedSession, result.id!);

		expect((fetched as AppError).statusCode).toBe(403);
	});

	it('Moderators can see friends-only poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'friends',
			status: 'published',
		});
		const result = await createAndApprovePoem(author, poem);

		await updateUserStatsRaw(thirdUser.id, { role: 'moderator' });
		const fetched = await getPoemById(thirdUser, result.id!);
		expect((fetched as AuthorPoem).id).toBe(result.id!);
	});

	it('Moderators can see unlisted poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'unlisted',
			status: 'published',
		});
		const result = await createAndApprovePoem(author, poem);
		await updateUserStatsRaw(thirdUser.id, { role: 'moderator' });
		const fetched = await getPoemById(thirdUser, result.id!);
		expect((fetched as AuthorPoem).id).toBe(result.id!);
	});

	it('Moderators cannot see draft poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'draft',
		});
		const result = (await createPoem(author, poem)) as PoemCreationResult;
		await updateUserStatsRaw(thirdUser.id, { role: 'moderator' });
		const fetched = await getPoemById(thirdUser, result.id!);
		expect((fetched as AppError).statusCode).toBe(403);
	});

	it('Unlisted poems do not appear in search results', async () => {
		const poem = makePoem(author.id, {
			visibility: 'unlisted',
			status: 'published',
			title: 'A Unique Title for Testing',
		});
		await createAndApprovePoem(author, poem);
		const authorPoems = await getAuthorPoems(otherUser, author.id);
		expect((authorPoems as AuthorPoem[]).length).toBe(0);
	});

	it('No one except the author can see private poems even if they have higher priveleges', async () => {
		const poem = makePoem(author.id, {
			visibility: 'private',
			status: 'published',
		});
		const result = await createAndApprovePoem(author, poem);

		await updateUserStatsRaw(thirdUser.id, { role: 'admin' });
		const fetched = await getPoemById(thirdUser, result.id!);
		expect((fetched as AppError).statusCode).toBe(403);

		const fetchedByAuthor = await getPoemById(author, result.id!);
		expect((fetchedByAuthor as AuthorPoem).id).toBe(result.id!);
	});

	it('Banned friends still cannot see friends-only poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'friends',
			status: 'published',
		});
		const result = await createAndApprovePoem(author, poem);
		await createFriendshipRaw(author.id, otherUser.id);

		await updateUserStatsRaw(otherUser.id, { status: 'banned' });
		const bannedSession = await loginUser(otherUser);
		const fetched = await getPoemById(bannedSession, result.id!);
		expect((fetched as AppError).statusCode).toBe(403);
	});

	it('Friend cannot see unapproved friends-only poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'friends',
			status: 'published',
		});
		const result = (await createPoem(author, poem)) as PoemCreationResult;
		await createFriendshipRaw(author.id, otherUser.id);

		const fetched = await getPoemById(otherUser, result.id!);
		expect((fetched as AppError).statusCode).toBe(403);
	});

	it('Only logged users can access poems regardless of their visibility', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});
		const result = await createAndApprovePoem(author, poem);
		const fetched = await getPoemById(
			{
				id: 0,
				cookie: '',
				email: '',
				password: '',
			},
			result.id!,
		);
		expect((fetched as AppError).statusCode).toBe(401);
	});
});
