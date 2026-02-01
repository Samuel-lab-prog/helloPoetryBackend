import { jsonRequest, type TestUser, PREFIX, app } from '../Helpers';

export type PoemInput = {
	title: string;
	content: string;
	slug: string;
	excerpt: string | null;
	tags?: string[];
	authorId: number;
	isCommentable?: boolean;
	addresseeId?: number;
	toPoemId?: number;
	status?: 'draft' | 'published' | 'scheduled';
	visibility?: 'public' | 'private' | 'friends' | 'unlisted';
	moderationStatus?: 'pending' | 'approved' | 'rejected' | 'removed';
};

/**
 * Create a poem
 */
export async function createPoem(user: TestUser, poem: PoemInput) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems`, {
			method: 'POST',
			headers: { Cookie: user.cookie },
			body: poem,
		}),
	);
	return await res.json();
}

/**
 * Edit a poem
 */
export async function editPoem(
	user: TestUser,
	poemId: number,
	updates: Partial<PoemInput>,
) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems/${poemId}`, {
			method: 'PATCH',
			headers: { Cookie: user.cookie },
			body: updates,
		}),
	);
	return await res.json();
}

/**
 * Delete a poem
 */
export async function deletePoem(user: TestUser, poemId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems/${poemId}`, {
			method: 'DELETE',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}

/**
 * Get a poem by ID
 */
export async function getPoem(user: TestUser, poemId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/poems/${poemId}`, {
			method: 'GET',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}

/**
 * List poems of a user (optionally filtered by visibility)
 */
export async function listUserPoems(
	user: TestUser,
	targetUserId: number,
	visibility?: string,
) {
	const url = new URL(`${PREFIX}/users/${targetUserId}/poems`);
	if (visibility) url.searchParams.set('visibility', visibility);

	const res = await app.handle(
		jsonRequest(url.toString(), {
			method: 'GET',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}
