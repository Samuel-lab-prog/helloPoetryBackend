import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@ClearDatabase';

import {
	sendFriendRequest,
	blockUser,
	unblockUser,
	getMyPrivateProfile,
	acceptFriendRequest,
	type AuthUser,
} from '../endpoints/Index';

import type {
	BlockedUserRecord,
	FriendRequestRecord,
} from '@Domains/friends-management/use-cases/Models';

import type { UserPrivateProfile } from '@Domains/users-management/use-cases/Models';
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
	it('User can block another user', async () => {
		const blocked = (await blockUser(
			user1.cookie,
			user2.id,
		)) as BlockedUserRecord;

		expect(blocked.blockedById).toBe(user1.id);
		expect(blocked.blockedUserId).toBe(user2.id);

		const me = (await getMyPrivateProfile(user1.cookie)) as UserPrivateProfile;
		expect(me.blockedUsersIds).toContain(user2.id);
	});

	it('User cannot block the same user twice', async () => {
		await blockUser(user1.cookie, user2.id);

		const result = await blockUser(user1.cookie, user2.id);
		expectAppError(result, 403);
	});

	it('Blocking removes existing friendship', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		await blockUser(user1.cookie, user2.id);

		const me = (await getMyPrivateProfile(user1.cookie)) as UserPrivateProfile;

		expect(me.stats.friendsIds).not.toContain(user2.id);
		expect(me.blockedUsersIds).toContain(user2.id);
	});

	it('Blocked user cannot receive a friend request', async () => {
		await blockUser(user1.cookie, user2.id);

		const result = await sendFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 403);
	});

	it('Blocked user cannot send a friend request', async () => {
		await blockUser(user1.cookie, user2.id);

		const result = await sendFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 403);
	});

	it('Blocked user cannot accept a pending friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await blockUser(user1.cookie, user2.id);

		const result = await acceptFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 403);
	});

	it('Blocked user does not appear in friends list', async () => {
		await blockUser(user1.cookie, user2.id);

		const me = (await getMyPrivateProfile(user1.cookie)) as UserPrivateProfile;
		expect(me.stats.friendsIds).not.toContain(user2.id);
	});

	it('Blocked user appears in blocked list', async () => {
		await blockUser(user1.cookie, user2.id);

		const me = (await getMyPrivateProfile(user1.cookie)) as UserPrivateProfile;
		expect(me.blockedUsersIds).toContain(user2.id);
	});

	it('User can unblock another user', async () => {
		await blockUser(user1.cookie, user2.id);
		await unblockUser(user1.cookie, user2.id);

		const me = (await getMyPrivateProfile(user1.cookie)) as UserPrivateProfile;
		expect(me.blockedUsersIds).not.toContain(user2.id);
	});

	it('After unblock, users can send friend requests again', async () => {
		await blockUser(user1.cookie, user2.id);
		await unblockUser(user1.cookie, user2.id);

		const request = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});
});
