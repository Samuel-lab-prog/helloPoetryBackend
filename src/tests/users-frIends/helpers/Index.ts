import { Elysia } from 'elysia';
import { server } from '../../../index';

export const app = new Elysia().use(server);
export const PREFIX = 'http://test/api/v1';

export interface TestUser {
	id: number;
	cookie: string;
	email: string;
	password: string;
}

function jsonRequest(
	url: string,
	options: Omit<RequestInit, 'body'> & { body?: unknown } = {},
) {
	return new Request(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
}

/**
 * Create a user via API
 */
export async function createUser(data: {
	email: string;
	password: string;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string;
}): Promise<TestUser> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users`, {
			method: 'POST',
			body: data,
		}),
	);
	if (res.status !== 201) throw new Error('Failed to create user');
	const body = (await res.json()) as any;
	return {
		id: body.id,
		cookie: '',
		email: data.email,
		password: data.password,
	};
}

/**
 * Log in a user and return the HTTP cookie
 */
export async function loginUser(user: TestUser): Promise<TestUser> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/auth/login`, {
			method: 'POST',
			body: { email: user.email, password: user.password },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to login');

	const cookie = res.headers.get('set-cookie');
	if (!cookie) throw new Error('Login did not return cookie');

	return { ...user, cookie };
}

/**
 * Send a friend request from one user to another
 */
export async function sendFriendRequest(from: TestUser, toUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/${toUserId}`, {
			method: 'POST',
			headers: { Cookie: from.cookie },
		}),
	);
	if (res.status !== 201) throw new Error('Failed to send friend request');
	return await res.json();
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(to: TestUser, fromUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/accept/${fromUserId}`, {
			method: 'PATCH',
			headers: { Cookie: to.cookie },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to accept friend request');
	return await res.json();
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(to: TestUser, fromUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/reject/${fromUserId}`, {
			method: 'PATCH',
			headers: { Cookie: to.cookie },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to reject friend request');
	return await res.json();
}

export async function unblockUser(by: TestUser, targetUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/unblock/${targetUserId}`, {
			method: 'PATCH',
			headers: { Cookie: by.cookie },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to unblock user');
	const resJson = await res.json();
	return resJson;
}

/**
 * Block another user
 */
export async function blockUser(by: TestUser, targetUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/block/${targetUserId}`, {
			method: 'PATCH',
			headers: { Cookie: by.cookie },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to block user');
	const resJson = await res.json();
	return resJson;
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(from: TestUser, toUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/cancel/${toUserId}`, {
			method: 'DELETE',
			headers: { Cookie: from.cookie },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to cancel friend request');
	return await res.json();
}

export async function deleteFriend(user: TestUser, friendUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/delete/${friendUserId}`, {
			method: 'DELETE',
			headers: { Cookie: user.cookie },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to delete friend');
	return await res.json();
}
/**
 * Get the authenticated user's profile
 */
export async function getMe(user: TestUser) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users/me`, {
			method: 'GET',
			headers: { Cookie: user.cookie },
		}),
	);
	if (res.status !== 200) throw new Error('Failed to fetch /users/me');
	return await res.json();
}
