import type {
	UpdatePoem,
	CreatePoem,
	CreatePoemResult,
} from '@Domains/poems-management/use-cases/commands/Models';

import {
	jsonRequest,
	type TestUser,
	PREFIX,
	app,
	updatePoemRaw,
} from '../Helpers';
import { testPoemsData, testPoemsForUpdate } from './Data';

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

export function makePoem(
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

export function makeUpdatedPoem(
	overrides: Partial<UpdatePoem> = {},
	index = 0,
): UpdatePoem {
	return {
		...testPoemsForUpdate[index]!,
		...overrides,
	};
}

export async function createAndApprovePoem(
	user: TestUser,
	poem: CreatePoem,
): Promise<unknown> {
	const result = (await createPoem(user, poem)) as CreatePoemResult;
	await updatePoemRaw(result.id!, { moderationStatus: 'approved' });
	return result;
}
