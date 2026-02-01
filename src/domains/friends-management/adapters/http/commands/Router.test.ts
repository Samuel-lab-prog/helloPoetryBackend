/* eslint-disable require-await */
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { createFriendsCommandsRouter } from './CommandsRouter';

mock.module('@AuthPlugin', () => {
	return {
		AuthPlugin: new Elysia().decorate('auth', {
			clientId: 7,
			clientRole: 'user',
			clientStatus: 'active',
		}),
	};
});

const sendFriendRequest = mock(async (p) => p);
const acceptFriendRequest = mock(async (p) => p);
const rejectFriendRequest = mock(async (p) => p);
const blockFriendRequest = mock(async (p) => p);
const deleteFriend = mock(async (p) => p);
const cancelFriendRequest = mock(async (p) => p);
const unblockFriendRequest = mock(async (p) => p);

function createApp() {
	return new Elysia().use(
		createFriendsCommandsRouter({
			sendFriendRequest,
			acceptFriendRequest,
			rejectFriendRequest,
			blockFriendRequest,
			deleteFriend,
			cancelFriendRequest,
			unblockFriendRequest,
		}),
	);
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

const PREFIX = 'http://test/friends';

beforeEach(() => {
	sendFriendRequest.mockClear();
	acceptFriendRequest.mockClear();
	rejectFriendRequest.mockClear();
	blockFriendRequest.mockClear();
	deleteFriend.mockClear();
});

describe('FriendsCommandsRouter', () => {
	it('PATCH /friends/accept/:id -> accepts request', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}/accept/9`, {
				method: 'PATCH',
			}),
		);

		expect(resp.status).toBe(200);

		expect(await resp.json()).toEqual({
			requesterId: 9,
			addresseeId: 7,
		});

		expect(acceptFriendRequest).toHaveBeenCalledTimes(1);
		expect(acceptFriendRequest).toHaveBeenCalledWith({
			requesterId: 9,
			addresseeId: 7,
		});
	});

	it('PATCH /friends/reject/:id -> rejects request', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}/reject/9`, {
				method: 'PATCH',
			}),
		);

		expect(resp.status).toBe(200);

		expect(await resp.json()).toEqual({
			requesterId: 9,
			addresseeId: 7,
		});

		expect(rejectFriendRequest).toHaveBeenCalledTimes(1);
		expect(rejectFriendRequest).toHaveBeenCalledWith({
			requesterId: 9,
			addresseeId: 7,
		});
	});

	it('PATCH /friends/block/:id -> blocks user', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}/block/33`, {
				method: 'PATCH',
			}),
		);

		expect(resp.status).toBe(200);

		expect(await resp.json()).toEqual({
			requesterId: 7,
			addresseeId: 33,
		});

		expect(blockFriendRequest).toHaveBeenCalledTimes(1);
		expect(blockFriendRequest).toHaveBeenCalledWith({
			requesterId: 7,
			addresseeId: 33,
		});
	});

	it('DELETE /friends/delete/:id -> deletes friend', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}/delete/50`, {
				method: 'DELETE',
			}),
		);

		expect(resp.status).toBe(200);

		expect(await resp.json()).toEqual({
			requesterId: 7,
			addresseeId: 50,
		});

		expect(deleteFriend).toHaveBeenCalledTimes(1);
		expect(deleteFriend).toHaveBeenCalledWith({
			requesterId: 7,
			addresseeId: 50,
		});
	});
});
