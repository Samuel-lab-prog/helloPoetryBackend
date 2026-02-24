import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@Prisma/clearDatabase';

import {
	sendFriendRequest,
	acceptFriendRequest,
	deleteFriend,
	type AuthUser,
} from '../endpoints/Index';

import type {
	FriendRequestRecord,
	FriendshipRecord,
	RemovedFriendRecord,
} from '@Domains/friends-management/use-cases/Models';

import { expectAppError } from '@GenericSubdomains/utils/testUtils';
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
	it('Users can become friends via friend request and acceptance', async () => {
		const request = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);

		const friendship = (await acceptFriendRequest(
			user2.cookie,
			user1.id,
		)) as FriendshipRecord;
		expect(friendship.userAId).toBeGreaterThan(0);
		expect(friendship.userBId).toBeGreaterThan(0);
	});

	it('User can delete a friend', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		const removed = (await deleteFriend(
			user1.cookie,
			user2.id,
		)) as RemovedFriendRecord;

		expect(removed.removedById).toBe(user1.id);
		expect(removed.removedId).toBe(user2.id);
	});

	it('User cannot delete the same friend twice', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);
		await deleteFriend(user1.cookie, user2.id);

		const result = await deleteFriend(user1.cookie, user2.id);
		expectAppError(result, 404);
	});

	it('User cannot delete someone who is not a friend', async () => {
		const result = await deleteFriend(user2.cookie, user1.id);
		expectAppError(result, 404);
	});

	it('After deletion, friendship can be recreated', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);
		await deleteFriend(user1.cookie, user2.id);

		const request = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);

		const friendship = (await acceptFriendRequest(
			user2.cookie,
			user1.id,
		)) as FriendshipRecord;

		expect(friendship.userAId).toBeGreaterThan(0);
		expect(friendship.userBId).toBeGreaterThan(0);
	});
});
