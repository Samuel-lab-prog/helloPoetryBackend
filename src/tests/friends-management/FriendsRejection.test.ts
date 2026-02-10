import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@ClearDatabase';

import {
	sendFriendRequest,
	rejectFriendRequest,
	getMyPrivateProfile,
	acceptFriendRequest,
	type AuthUser,
} from '../endpoints/Index';

import type {
	FriendRequestRecord,
	FriendRequestRejectionRecord,
} from '@Domains/friends-management/use-cases/Models';

import type { UserPrivateProfile } from '@Domains/users-management/use-cases/Models';
import { expectAppError } from '../TestsUtils';
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

	it('User can reject a friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const rejected = (await rejectFriendRequest(
			user2.cookie,
			user1.id,
		)) as FriendRequestRejectionRecord;

		expect(rejected.rejectedId).toBe(user2.id);
		expect(rejected.rejecterId).toBe(user1.id);
	});

	it('User cannot reject the same friend request twice', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await rejectFriendRequest(user2.cookie, user1.id);

		const result = await rejectFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 404);
	});

	it('Requester cannot reject its own friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const result = await rejectFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 404);
	});

	it('Rejected request is removed from receiver private profile', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await rejectFriendRequest(user2.cookie, user1.id);

		const me = (await getMyPrivateProfile(user2.cookie)) as UserPrivateProfile;

		expect(
			me.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);
	});

	it('Rejected request is removed from requester private profile', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await rejectFriendRequest(user2.cookie, user1.id);

		const me = (await getMyPrivateProfile(user1.cookie)) as UserPrivateProfile;

		expect(
			me.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);
	});

	it('Rejected request cannot be accepted later', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await rejectFriendRequest(user2.cookie, user1.id);

		const result = await acceptFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 404);
	});

	it('After rejection, requester can send a new friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await rejectFriendRequest(user2.cookie, user1.id);

		const newRequest = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(newRequest.requesterId).toBe(user1.id);
		expect(newRequest.addresseeId).toBe(user2.id);
	});

	it('Rejection does not create friendship', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await rejectFriendRequest(user2.cookie, user1.id);

		const me1 = (await getMyPrivateProfile(user1.cookie)) as UserPrivateProfile;
		const me2 = (await getMyPrivateProfile(user2.cookie)) as UserPrivateProfile;

		expect(me1.stats.friendsIds).not.toContain(user2.id);
		expect(me2.stats.friendsIds).not.toContain(user1.id);
	});
});
