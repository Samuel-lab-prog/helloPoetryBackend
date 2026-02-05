import { type TestUser, PREFIX, app } from '../Helpers.ts';

import { jsonRequest } from '../TestsUtils.ts';

export async function sendFriendRequest(from: TestUser, addresseeId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/${addresseeId}`, {
			method: 'POST',
			headers: { Cookie: from.cookie },
		}),
	);
	return await res.json();
}

export async function acceptFriendRequest(to: TestUser, requesterId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/accept/${requesterId}`, {
			method: 'PATCH',
			headers: { Cookie: to.cookie },
		}),
	);
	return await res.json();
}

export async function rejectFriendRequest(to: TestUser, requesterId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/reject/${requesterId}`, {
			method: 'PATCH',
			headers: { Cookie: to.cookie },
		}),
	);
	return await res.json();
}

export async function unblockUser(by: TestUser, targetUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/unblock/${targetUserId}`, {
			method: 'PATCH',
			headers: { Cookie: by.cookie },
		}),
	);
	return await res.json();
}

export async function blockUser(by: TestUser, targetUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/block/${targetUserId}`, {
			method: 'PATCH',
			headers: { Cookie: by.cookie },
		}),
	);
	return await res.json();
}

export async function cancelFriendRequest(from: TestUser, addresseeId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/cancel/${addresseeId}`, {
			method: 'DELETE',
			headers: { Cookie: from.cookie },
		}),
	);
	return await res.json();
}

export async function deleteFriend(user: TestUser, friendUserId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/delete/${friendUserId}`, {
			method: 'DELETE',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}

export async function getMyPrivateProfile(user: TestUser) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users/me`, {
			method: 'GET',
			headers: { Cookie: user.cookie },
		}),
	);
	return await res.json();
}
