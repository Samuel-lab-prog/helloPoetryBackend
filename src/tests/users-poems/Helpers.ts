import { jsonRequest, type TestUser, PREFIX, app } from '../Helpers';
import type { CreatePoem } from '@Domains/poems-management/use-cases/commands/models/CreatePoem';

export async function createPoem(user: TestUser, poem: CreatePoem) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems`, {
			method: 'POST',
			headers: { Cookie: user.cookie },
			body: poem,
		}),
	);
	return await res.json();
}

export async function getMyPoems(user: TestUser) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems/me`, {
			method: 'GET',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}

export async function getPoemById(user: TestUser, poemId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems/${poemId}`, {
			method: 'GET',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}

export async function getAuthorPoems(user: TestUser, authorId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems/authors/${authorId}`, {
			method: 'GET',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}
