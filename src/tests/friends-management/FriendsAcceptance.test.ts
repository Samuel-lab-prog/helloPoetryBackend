import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@Prisma/clearDatabase';

import {
	sendFriendRequest,
	acceptFriendRequest,
	getUserProfile,
	cancelFriendRequest,
	rejectFriendRequest,
	type AuthUser,
} from '../endpoints/Index';

import type {
	FriendRequestRecord,
	FriendshipRecord,
} from '@Domains/friends-management/use-cases/Models';

import type { UserPrivateProfile } from '@Domains/users-management/use-cases/Models';
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
	it('User can send a friend request', async () => {
		const request = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});

	it('User cannot send a duplicate friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const result = await sendFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 409);
	});

	it('Sent friend request appears in requester private profile', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const me = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;

		expect(
			me.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(true);
	});

	it('Received friend request appears in addressee private profile', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const me = (await getUserProfile(
			user2.cookie,
			user2.id,
		)) as unknown as UserPrivateProfile;

		expect(
			me.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(true);
	});

	it('User can accept a friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const accepted = (await acceptFriendRequest(
			user2.cookie,
			user1.id,
		)) as FriendshipRecord;

		expect(accepted.userAId).toBeGreaterThan(0);
		expect(accepted.userBId).toBeGreaterThan(0);
	});

	it('Requester cannot accept its own friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const result = await acceptFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 404);
	});

	it('User cannot accept the same friend request twice', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		const result = await acceptFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 409);
	});

	it('Accepted request is removed from both private profiles', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		const me1 = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;
		const me2 = (await getUserProfile(
			user2.cookie,
			user2.id,
		)) as unknown as UserPrivateProfile;

		expect(
			me1.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);

		expect(
			me2.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);
	});

	it('Accepting a request creates friendship for both users', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		const me1 = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;
		const me2 = (await getUserProfile(
			user2.cookie,
			user2.id,
		)) as unknown as UserPrivateProfile;

		expect(me1.stats.friendsIds).toContain(user2.id);
		expect(me2.stats.friendsIds).toContain(user1.id);
	});

	it('Accepted request cannot be rejected later', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		const result = await rejectFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 404);
	});

	it('Accepted request cannot be cancelled by requester', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		const result = await cancelFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 404);
	});
});
