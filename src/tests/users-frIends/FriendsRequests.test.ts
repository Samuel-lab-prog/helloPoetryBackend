import { describe, it, beforeEach, afterAll, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import {
	createUser,
	loginUser,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	cancelFriendRequest,
	deleteFriend,
	blockUser,
	getMe,
	type TestUser,
} from './helpers/Index';
import type { FriendRequest } from '@Domains/friends-management/use-cases/commands/models/FriendRequest';
import type { PrivateProfile } from '@Domains/users-management/use-cases/queries/Index';

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

afterAll(async () => {
	await clearDatabase();
});

describe('INTEGRATION - Friends Requests acceptance', () => {
	it('User1 sends a friend request to User2', async () => {
		const request = (await sendFriendRequest(user1, user2.id)) as FriendRequest;
		expect(request.fromUserId).toBe(user1.id);
		expect(request.toUserId).toBe(user2.id);
	});

	it('User1 cannot send a duplicate friend request', async () => {
		await sendFriendRequest(user1, user2.id);
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});

	it('User1 sees the sent friend request in users/me', async () => {
		await sendFriendRequest(user1, user2.id);
		const me = (await getMe(user1)) as PrivateProfile;
		expect(
			me.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(true);
	});

	it('User2 sees the received friend request in users/me', async () => {
		await sendFriendRequest(user1, user2.id);
		const me = (await getMe(user2)) as PrivateProfile;
		expect(
			me.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(true);
	});

	it('User2 accepts the friend request from User1', async () => {
		await sendFriendRequest(user1, user2.id);
		const accepted = (await acceptFriendRequest(
			user2,
			user1.id,
		)) as FriendRequest;
		expect(accepted.fromUserId).toBe(user1.id);
		expect(accepted.toUserId).toBe(user2.id);
	});

	it('User2 cannot accept the same friend request again', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);
		try {
			await acceptFriendRequest(user2, user1.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to accept friend request');
		}
	});
});

describe('INTEGRATION - Friend Requests Rejection', () => {
	it('User1 sends a friend request to User2', async () => {
		const request = (await sendFriendRequest(user1, user2.id)) as FriendRequest;
		expect(request.fromUserId).toBe(user1.id);
		expect(request.toUserId).toBe(user2.id);
	});

	it('User2 rejects the friend request from User1', async () => {
		await sendFriendRequest(user1, user2.id);
		const rejected = (await rejectFriendRequest(
			user2,
			user1.id,
		)) as FriendRequest;
		expect(rejected.fromUserId).toBe(user1.id);
		expect(rejected.toUserId).toBe(user2.id);
	});

	it('User2 cannot reject the same friend request again', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);
		try {
			await rejectFriendRequest(user2, user1.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to reject friend request');
		}
	});

	it('Rejected request no longer appears in users/me for User2', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);
		const me = (await getMe(user2)) as PrivateProfile;
		expect(
			me.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);
	});

	it('Rejected request no longer appears in users/me for User1', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);
		const me = (await getMe(user1)) as PrivateProfile;
		expect(
			me.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);
	});
});

describe('INTEGRATION - Block Users', () => {
	it('User1 blocks User2', async () => {
		const blocked = (await blockUser(user1, user2.id)) as FriendRequest;
		expect(blocked.fromUserId).toBe(user1.id);
		expect(blocked.toUserId).toBe(user2.id);
		const me = (await getMe(user1)) as PrivateProfile;
		expect(me.blockedUsersIds.includes(user2.id)).toBe(true);
	});
	it('User1 cannot block User2 again', async () => {
		await blockUser(user1, user2.id);
		try {
			await blockUser(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to block user');
		}
	});

	it('User1 cannot send a friend request to User2 after blocking', async () => {
		await blockUser(user1, user2.id);
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});

	it('User2 cannot send a friend request to User1 after being blocked', async () => {
		await blockUser(user1, user2.id);
		try {
			await sendFriendRequest(user2, user1.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});

	it('Blocked user does not appear in users/me friend list', async () => {
		await blockUser(user1, user2.id);
		const me = (await getMe(user1)) as PrivateProfile;
		expect(me.stats.friendsIds.includes(user2.id)).toBe(false);
	});

	it('Blocked user appears in users/me blocked list', async () => {
		await blockUser(user1, user2.id);
		const me = (await getMe(user1)) as PrivateProfile;
		expect(me.blockedUsersIds.includes(user2.id)).toBe(true);
	});
});

describe('INTEGRATION - Advanced Social Interactions', () => {
	it('User1 sends a friend request to User2 and cancels it', async () => {
		const request = (await sendFriendRequest(user1, user2.id)) as FriendRequest;
		expect(request.fromUserId).toBe(user1.id);
		await cancelFriendRequest(user1, user2.id);
		const me1 = (await getMe(user1)) as PrivateProfile;
		const me2 = (await getMe(user2)) as PrivateProfile;
		expect(
			me1.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);
		expect(
			me2.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);
		try {
			await cancelFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to cancel friend request');
		}
	});

	it('User1 and User2 become friends and then unfriend', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);
		let me1 = (await getMe(user1)) as PrivateProfile;
		let me2 = (await getMe(user2)) as PrivateProfile;
		expect(me1.stats.friendsIds.includes(user2.id)).toBe(true);
		expect(me2.stats.friendsIds.includes(user1.id)).toBe(true);
		await deleteFriend(user1, user2.id);
		me1 = (await getMe(user1)) as PrivateProfile;
		me2 = (await getMe(user2)) as PrivateProfile;
		expect(me1.stats.friendsIds.includes(user2.id)).toBe(false);
		expect(me2.stats.friendsIds.includes(user1.id)).toBe(false);
		await blockUser(user1, user2.id);
		me1 = (await getMe(user1)) as PrivateProfile;
		expect(me1.blockedUsersIds.includes(user2.id)).toBe(true);
	});

	it('Cannot send friend request to a user who blocked you', async () => {
		await blockUser(user2, user1.id);
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});
});
