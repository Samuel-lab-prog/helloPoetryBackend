import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import {
	createUser,
	loginUser,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockUser,
	getMe,
	type TestUser,
} from './helpers/Index';
import type { FriendRequest } from '@Domains/friends-management/use-cases/commands/models/FriendRequest';
import type { PrivateProfile } from '@Domains/users-management/use-cases/queries/Index';

let user1: TestUser;
let user2: TestUser;

beforeAll(async () => {
	await clearDatabase();

	// Create two users
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

	// Log in both users
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
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});

	it('User1 sees the sent friend request in users/me', async () => {
		const me = (await getMe(user1)) as PrivateProfile;
		expect(
			me.friendshipRequestsSent.some(
				(r: PrivateProfile['friendshipRequestsSent'][0]) =>
					r.addresseeId === user2.id,
			),
		).toBe(true);
	});

	it('User2 sees the received friend request in users/me', async () => {
		const me = (await getMe(user2)) as PrivateProfile;
		expect(
			me.friendshipRequestsReceived.some(
				(r: PrivateProfile['friendshipRequestsReceived'][0]) =>
					r.requesterId === user1.id,
			),
		).toBe(true);
	});

	it('User2 accepts the friend request from User1', async () => {
		const accepted = (await acceptFriendRequest(
			user2,
			user1.id,
		)) as FriendRequest;
		expect(accepted.fromUserId).toBe(user1.id);
		expect(accepted.toUserId).toBe(user2.id);
	});

	it('User2 cannot accept the same friend request again', async () => {
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
		const rejected = (await rejectFriendRequest(
			user2,
			user1.id,
		)) as FriendRequest;
		expect(rejected.fromUserId).toBe(user1.id);
		expect(rejected.toUserId).toBe(user2.id);
	});

	it('User2 cannot reject the same friend request again', async () => {
		try {
			await rejectFriendRequest(user2, user1.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to reject friend request');
		}
	});

	it('Rejected request no longer appears in users/me for User2', async () => {
		const me = (await getMe(user2)) as PrivateProfile;
		expect(
			me.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);
	});

	it('Rejected request no longer appears in users/me for User1', async () => {
		const me = (await getMe(user1)) as PrivateProfile;
		expect(
			me.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);
	});
});

describe('INTEGRATION - Block Users', () => {
	it('User1 blocks User2', async () => {
		const blocked = (await blockUser(user1, user2.id)) as FriendRequest;
		expect(blocked.toUserId).toBe(user2.id);
	});

	it('User1 cannot block User2 again', async () => {
		try {
			await blockUser(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to block user');
		}
	});

	it('User1 cannot send a friend request to User2 after blocking', async () => {
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});

	it('User2 cannot send a friend request to User1 after being blocked', async () => {
		try {
			await sendFriendRequest(user2, user1.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});

	it('Blocked user does not appear in users/me friend list', async () => {
		const me = (await getMe(user1)) as PrivateProfile;
		expect(me.stats.friendsIds.includes(user2.id)).toBe(false);
	});
});

describe('INTEGRATION - Advanced Social Interactions', () => {
	it('User1 sends a friend request to User2 and cancels it', async () => {
		const request = (await sendFriendRequest(user1, user2.id)) as FriendRequest;
		expect(request.fromUserId).toBe(user1.id);

		// Cancel friend request
		await fetch(`/friends/cancel/${user2.id}`, {
			method: 'POST',
			headers: { cookie: user1.cookie },
		});

		// Check users/me for both
		const me1 = (await getMe(user1)) as PrivateProfile;
		const me2 = (await getMe(user2)) as PrivateProfile;

		expect(
			me1.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);
		expect(
			me2.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);

		// Attempt to cancel again should fail
		try {
			await fetch(`/friends/cancel/${user2.id}`, {
				method: 'POST',
				headers: { cookie: user1.cookie },
			});
		} catch (e) {
			expect((e as Error).message).toContain('Failed to cancel friend request');
		}
	});

	it('User1 and User2 become friends and then unfriend', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		let me1 = (await getMe(user1)) as PrivateProfile;
		let me2 = (await getMe(user2)) as PrivateProfile;

		expect(me1.stats.friendsIds.some((id) => id === user2.id)).toBe(true);
		expect(me2.stats.friendsIds.some((id) => id === user1.id)).toBe(true);

		// Unfriend
		await fetch(`/friends/unfriend/${user2.id}`, {
			method: 'POST',
			headers: { cookie: user1.cookie },
		});

		me1 = (await getMe(user1)) as PrivateProfile;
		me2 = (await getMe(user2)) as PrivateProfile;

		expect(me1.stats.friendsIds.some((id) => id === user2.id)).toBe(false);
		expect(me2.stats.friendsIds.some((id) => id === user1.id)).toBe(false);

		// Block after unfriending
		await blockUser(user1, user2.id);
		me1 = (await getMe(user1)) as PrivateProfile;
		expect(me1.blockedUsersIds.some((id) => id === user2.id)).toBe(true);
	});

	it('Blocking a user with a pending friend request cancels it', async () => {
		// User1 sends request
		await sendFriendRequest(user1, user2.id);

		// User2 blocks User1
		await blockUser(user2, user1.id);

		// Requests should disappear
		const me1 = (await getMe(user1)) as PrivateProfile;
		const me2 = (await getMe(user2)) as PrivateProfile;

		expect(
			me1.friendshipRequestsSent.some((u) => u.addresseeId === user2.id),
		).toBe(false);
		expect(
			me2.friendshipRequestsReceived.some((u) => u.requesterId === user1.id),
		).toBe(false);

		// User1 cannot send new request
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}
	});

	it('Cannot send friend request to a user who blocked you', async () => {
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain(
				'cannot send friend request to blocked user',
			);
		}
	});

	it('users/me reflects correct lists after complex actions', async () => {
		// Reset: unblock first
		await fetch(`/users/unblock/${user2.id}`, {
			method: 'POST',
			headers: { cookie: user1.cookie },
		});

		// Send → reject → block → unblock
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);
		await blockUser(user2, user1.id);
		await fetch(`/users/unblock/${user2.id}`, {
			method: 'POST',
			headers: { cookie: user2.cookie },
		});

		const me1 = (await getMe(user1)) as PrivateProfile;
		const me2 = (await getMe(user2)) as PrivateProfile;

		expect(me1.stats.friendsIds.length).toBe(0);
		expect(me1.friendshipRequestsSent.length).toBe(0);
		expect(me1.blockedUsersIds.length).toBe(0);

		expect(me2.stats.friendsIds.length).toBe(0);
		expect(me2.friendshipRequestsReceived.length).toBe(0);
		expect(me2.blockedUsersIds.length).toBe(0);
	});

	it('Reciprocal blocking prevents friend requests and friendships', async () => {
		// User1 blocks User2
		await blockUser(user1, user2.id);
		// User2 blocks User1
		await blockUser(user2, user1.id);

		// Neither can send request
		try {
			await sendFriendRequest(user1, user2.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}

		try {
			await sendFriendRequest(user2, user1.id);
		} catch (e) {
			expect((e as Error).message).toContain('Failed to send friend request');
		}

		// Unblock both to reset
		await fetch(`/users/unblock/${user1.id}`, {
			method: 'POST',
			headers: { cookie: user2.cookie },
		});
		await fetch(`/users/unblock/${user2.id}`, {
			method: 'POST',
			headers: { cookie: user1.cookie },
		});
	});
});
