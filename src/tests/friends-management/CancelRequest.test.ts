import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@ClearDatabase';

import {
	sendFriendRequest,
	cancelFriendRequest,
	type AuthUser,
} from '../endpoints/Index';

import type {
	CancelFriendRequestRecord,
	FriendRequestRecord,
} from '@Domains/friends-management/use-cases/Models';

import { expectAppError } from '@TestUtils';
import { setupHttpUsers } from 'tests/TestsSetups.ts';

let user1: AuthUser;
let user2: AuthUser;

beforeEach(async () => {
	await clearDatabase();

	const users = await setupHttpUsers();

	if (!users[0] || !users[1])
		throw new Error('Not enough users set up for tests');

	user1 = users[0];
	user2 = users[1];
});

describe('INTEGRATION - Friends Management', () => {
	it('User can send a friend request', async () => {
		const request = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});

	it('User can cancel a sent friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const cancelled = (await cancelFriendRequest(
			user1.cookie,
			user2.id,
		)) as CancelFriendRequestRecord;

		expect(cancelled.cancellerId).toBe(user1.id);
		expect(cancelled.cancelledId).toBe(user2.id);
	});

	it('User cannot cancel the same friend request twice', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await cancelFriendRequest(user1.cookie, user2.id);

		const result = await cancelFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 404);
	});

	it('Addressee cannot cancel a friend request they did not send', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const result = await cancelFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 404);
	});

	it('User cannot cancel a non-existing friend request', async () => {
		const result = await cancelFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 404);
	});

	it('After cancellation, requester can send a new friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await cancelFriendRequest(user1.cookie, user2.id);

		const newRequest = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(newRequest.requesterId).toBe(user1.id);
		expect(newRequest.addresseeId).toBe(user2.id);
	});
});
