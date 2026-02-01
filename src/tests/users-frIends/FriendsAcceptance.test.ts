import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import {
	createUser,
	loginUser,
	sendFriendRequest,
	acceptFriendRequest,
	getMyPrivateProfile,
	type TestUser,
} from './Helpers';
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

describe('INTEGRATION - Friends Requests acceptance', () => {
	it('User1 sends a friend request to User2', async () => {
		const request = (await sendFriendRequest(user1, user2.id)) as FriendRequest;
		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});

	it('User1 cannot send a duplicate friend request', async () => {
		const firstReq = await sendFriendRequest(user1, user2.id);
		const secondReq = await sendFriendRequest(user1, user2.id);
		expect(firstReq).not.toEqual(secondReq);
		expect((secondReq as AppError).statusCode).toEqual(409);
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

	it('User2 cannot accept the same friend request again', async () => {
		await sendFriendRequest(user1, user2.id);
		const firstReq = await acceptFriendRequest(user2, user1.id);
		const secondReq = await acceptFriendRequest(user2, user1.id);
		expect(firstReq).not.toEqual(secondReq);
		expect((secondReq as AppError).statusCode).toEqual(409);
	});
});
