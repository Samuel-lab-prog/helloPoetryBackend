import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import {
	sendFriendRequest,
	acceptFriendRequest,
	getMyPrivateProfile,
	cancelFriendRequest,
	rejectFriendRequest,
} from './Helpers';
import { createUser, type TestUser, loginUser } from '../Helpers';

import type { FriendRequest } from '@Domains/friends-management/use-cases/commands/models/FriendRequest';
import type { PrivateProfile } from '@Domains/users-management/use-cases/queries/Index';
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
	it('User1 sends a friend request to User2', async () => {
		const request = (await sendFriendRequest(user1, user2.id)) as FriendRequest;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});

	it('User1 cannot send a duplicate friend request', async () => {
		await sendFriendRequest(user1, user2.id);
		const secondReq = await sendFriendRequest(user1, user2.id);

		expect((secondReq as AppError).statusCode).toBe(409);
	});

	it('User1 sees the sent friend request in users/me', async () => {
		await sendFriendRequest(user1, user2.id);

		const me = (await getMyPrivateProfile(user1)) as PrivateProfile;

		expect(
			me.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(true);
	});

	it('User2 sees the received friend request in users/me', async () => {
		await sendFriendRequest(user1, user2.id);

		const me = (await getMyPrivateProfile(user2)) as PrivateProfile;

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

		expect(accepted.requesterId).toBe(user1.id);
		expect(accepted.addresseeId).toBe(user2.id);
	});

	it('Requester cannot accept its own friend request', async () => {
		await sendFriendRequest(user1, user2.id);

		const res = await acceptFriendRequest(user1, user2.id);

		expect((res as AppError).statusCode).toBe(404);
	});

	it('User2 cannot accept the same friend request again', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		const secondReq = await acceptFriendRequest(user2, user1.id);

		expect((secondReq as AppError).statusCode).toBe(409);
	});

	it('Accepted request disappears from both inboxes', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		const me1 = (await getMyPrivateProfile(user1)) as PrivateProfile;
		const me2 = (await getMyPrivateProfile(user2)) as PrivateProfile;

		expect(
			me1.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);

		expect(
			me2.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);
	});

	it('Accepting creates friendship for both users', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		const me1 = (await getMyPrivateProfile(user1)) as PrivateProfile;
		const me2 = (await getMyPrivateProfile(user2)) as PrivateProfile;

		expect(me1.stats.friendsIds.includes(user2.id)).toBe(true);
		expect(me2.stats.friendsIds.includes(user1.id)).toBe(true);
	});

	it('Accepted request cannot be rejected later', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		const res = await rejectFriendRequest(user2, user1.id);

		expect((res as AppError).statusCode).toBe(404);
	});

	it('Accepted request cannot be cancelled by requester', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		const res = await cancelFriendRequest(user1, user2.id);

		expect((res as AppError).statusCode).toBe(404);
	});
});
