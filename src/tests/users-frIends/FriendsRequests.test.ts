import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import {
	createUser,
	loginUser,
	sendFriendRequest,
	acceptFriendRequest,
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

describe('INTEGRATION - Friends Requests', () => {
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
