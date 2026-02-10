import type {
	UpdatePoem,
	CreatePoem,
	CreatePoemResult,
} from '@Domains/poems-management/use-cases/Models.ts';
import { type TestUser, PREFIX, app, updatePoemRaw } from '../Helpers.ts';
import { jsonRequest } from '../TestsUtils.ts';
import { poemsData, poemsForUpdate } from '../data/TestsData.ts';

export async function createPoem(
	user: TestUser,
	poem: CreatePoem,
): Promise<unknown> {
	const request = jsonRequest(`${PREFIX}/poems`, {
		method: 'POST',
		headers: { Cookie: user.cookie },
		body: poem,
	});
	const response = await app.handle(request);
	return await response.json();
}

export async function getMyPoems(user: TestUser): Promise<unknown> {
	const request = jsonRequest(`${PREFIX}/poems/me`, {
		method: 'GET',
		headers: { Cookie: user.cookie },
	});
	const response = await app.handle(request);
	return await response.json();
}

export async function getPoemById(
	user: TestUser,
	poemId: number,
): Promise<unknown> {
	const request = jsonRequest(`${PREFIX}/poems/${poemId}`, {
		method: 'GET',
		headers: { Cookie: user.cookie },
	});
	const response = await app.handle(request);
	return await response.json();
}

export async function getAuthorPoems(
	user: TestUser,
	authorId: number,
): Promise<unknown> {
	const request = jsonRequest(`${PREFIX}/poems/authors/${authorId}`, {
		method: 'GET',
		headers: { Cookie: user.cookie },
	});
	const response = await app.handle(request);
	return await response.json();
}

export async function updatePoem(
	user: TestUser,
	poemId: number,
	data: Partial<UpdatePoem>,
): Promise<unknown> {
	const request = jsonRequest(`${PREFIX}/poems/${poemId}`, {
		method: 'PUT',
		headers: { Cookie: user.cookie },
		body: data,
	});
	const response = await app.handle(request);
	return await response.json();
}

export async function createAndApprovePoem(
	user: TestUser,
	poem: CreatePoem,
): Promise<unknown> {
	const result = (await createPoem(user, poem)) as CreatePoemResult;
	await updatePoemRaw(result.id!, { moderationStatus: 'approved' });
	return result;
}

// ------------------- Helper functions for test data generation -----------------

/**
 * Returns a poem object with default data, allowing overrides.
 * @param authorId The ID of the poem's author.
 * @param overrides Optional field overrides for the poem object.
 * @param index Optional index to avoid duplicate titles in tests.
 * @returns The constructed poem object.
 */
export function makePoem(
	authorId: number,
	overrides: Partial<CreatePoem> = {},
	index = 0,
): CreatePoem & { authorId: number } {
	return {
		...poemsData[index]!,
		authorId,
		...overrides,
	};
}

/**
 * Returns an object of type UpdatePoem with default data, allowing overrides.
 * @param overrides Optional field overrides for the updated poem object.
 * @param index Optional index to avoid duplicate titles in tests.
 * @returns The constructed updated poem object.
 */
export function makeUpdatedPoem(
	overrides: Partial<UpdatePoem> = {},
	index = 0,
): UpdatePoem {
	return {
		...poemsForUpdate[index]!,
		...overrides,
	};
}

