import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import {
	sendFriendRequest,
	blockUser,
	getMyPrivateProfile,
	unblockUser,
	acceptFriendRequest,
} from '../endpoints/Users';
import { createUser, type TestUser, loginUser } from '../Helpers';

import type {
	BlockedUserRecord,
	FriendRequestRecord,
} from '@Domains/friends-management/use-cases/Models';
import type { UserPrivateProfile } from '@Domains/users-management/use-cases/Models';
import type { AppError } from '@AppError';

let user1: TestUser;
let user2: TestUser;

beforeEach(async () => {
	await clearDatabase();
	user1 = await createUser({
		email: 'user1@example.com',
		password: 'password1',
		nickname: 'user1',
		name: 'User One',
		bio: 'Bio of User One',
		avatarUrl: 'http://example.com/avatar1.png',
	});
	user2 = await createUser({
		email: 'user2@example.com',
		password: 'password2',
		nickname: 'user2',
		name: 'User Two',
		bio: 'Bio of User Two',
		avatarUrl: 'http://example.com/avatar2.png',
	});
	user1 = await loginUser(user1);
	user2 = await loginUser(user2);
});

describe('INTEGRATION - Friends Management', () => {
	it('User1 blocks User2', async () => {
		const blocked = (await blockUser(user1, user2.id)) as BlockedUserRecord;
		expect(blocked.blockedById).toBe(user1.id);
		expect(blocked.blockedUserId).toBe(user2.id);

		const me = (await getMyPrivateProfile(user1)) as UserPrivateProfile;
		expect(me.blockedUsersIds.includes(user2.id)).toBe(true);
	});

	it('User1 cannot block User2 multiple times', async () => {
		await blockUser(user1, user2.id);
		const secondBlock = await blockUser(user1, user2.id);

		expect((secondBlock as AppError).statusCode).toBe(403);
	});

	it('Blocking removes existing friendship', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		await blockUser(user1, user2.id);

		const me = (await getMyPrivateProfile(user1)) as UserPrivateProfile;
		expect(me.stats.friendsIds.includes(user2.id)).toBe(false);
		expect(me.blockedUsersIds.includes(user2.id)).toBe(true);
	});

	it('User1 cannot send a friend request to User2 after blocking', async () => {
		await blockUser(user1, user2.id);

		const req = await sendFriendRequest(user1, user2.id);
		expect((req as AppError).statusCode).toBe(403);
	});

	it('User2 cannot send a friend request to User1 after being blocked', async () => {
		await blockUser(user1, user2.id);

		const req = await sendFriendRequest(user2, user1.id);
		expect((req as AppError).statusCode).toBe(403);
	});

	it('Blocked user cannot accept an old pending request', async () => {
		await sendFriendRequest(user1, user2.id);
		await blockUser(user1, user2.id);

		const res = await acceptFriendRequest(user2, user1.id);
		expect((res as AppError).statusCode).toBe(403);
	});

	it('Blocked user does not appear in users/me friend list', async () => {
		await blockUser(user1, user2.id);

		const me = (await getMyPrivateProfile(user1)) as UserPrivateProfile;
		expect(me.stats.friendsIds.includes(user2.id)).toBe(false);
	});

	it('Blocked user appears in users/me blocked list', async () => {
		await blockUser(user1, user2.id);

		const me = (await getMyPrivateProfile(user1)) as UserPrivateProfile;
		expect(me.blockedUsersIds.includes(user2.id)).toBe(true);
	});

	it('User1 can unblock User2', async () => {
		await blockUser(user1, user2.id);
		await unblockUser(user1, user2.id);

		const me = (await getMyPrivateProfile(user1)) as UserPrivateProfile;
		expect(me.blockedUsersIds.includes(user2.id)).toBe(false);
	});

	it('After unblock, users can send friend request again', async () => {
		await blockUser(user1, user2.id);
		await unblockUser(user1, user2.id);

		const req = (await sendFriendRequest(
			user1,
			user2.id,
		)) as FriendRequestRecord;

		expect(req.requesterId).toBe(user1.id);
		expect(req.addresseeId).toBe(user2.id);
	});
});
