import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

import { createPoem, getMyPoems } from './Helpers.ts';

import { testUsersData, testPoemsData } from './Data.ts';

import {
	type TestUser,
	createUser,
	loginUser,
	updatePoemRaw,
} from '../Helpers.ts';

import type {
	CreatePoem,
	CreatePoemResult,
} from '@Domains/poems-management/use-cases/commands/Models';
import type { MyPoem } from '@Domains/poems-management/use-cases/queries/Models.ts';

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
): Promise<CreatePoemResult> {
	const result = (await createPoem(user, poem)) as CreatePoemResult;
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
	it('A user can dedicate a poem to another user when creating a poem', async () => {
		const toCreate = createPoem(
			author,
			makePoem(
				author.id,
				{ visibility: 'private', addresseeId: otherUser.id },
				0,
			),
		);
		await createAndApprovePoem(author, toCreate);
		const myPoems = (await getMyPoems(author)) as Array<MyPoem>;
		console.log(myPoems);
		expect(myPoems.length).toBe(1);
		expect(myPoems[0]!).toBeDefined();
		expect(myPoems[0]!.dedicatedToUserId).toBe(otherUser.id);
	});
});
