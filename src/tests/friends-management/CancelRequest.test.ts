import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import { sendFriendRequest, cancelFriendRequest } from '../endpoints/Users';
import { createUser, type TestUser, loginUser } from '../Helpers';

import type {
	CancelFriendRequestRecord,
	FriendRequestRecord,
} from '@Domains/friends-management/use-cases/Models';
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
		const request = (await sendFriendRequest(
			user1,
			user2.id,
		)) as FriendRequestRecord;
		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});

	it('User1 cancels the friend request to User2', async () => {
		await sendFriendRequest(user1, user2.id);

		const cancelled = (await cancelFriendRequest(
			user1,
			user2.id,
		)) as CancelFriendRequestRecord;

		expect(cancelled.cancellerId).toBe(user1.id);
		expect(cancelled.cancelledId).toBe(user2.id);
	});

	it('User1 cannot cancel the same friend request again', async () => {
		await sendFriendRequest(user1, user2.id);

		const firstReq = await cancelFriendRequest(user1, user2.id);
		const secondReq = await cancelFriendRequest(user1, user2.id);

		expect(firstReq).not.toEqual(secondReq);
		expect((secondReq as AppError).statusCode).toEqual(404);
	});

	it('User2 cannot cancel a friend request sent by User1', async () => {
		await sendFriendRequest(user1, user2.id);
		const result = await cancelFriendRequest(user2, user1.id);
		expect((result as AppError).statusCode).toEqual(404);
	});

	it('User1 cannot cancel a non-existing friend request', async () => {
		const result = await cancelFriendRequest(user1, user2.id);
		expect((result as AppError).statusCode).toEqual(404);
	});

	it('User1 can send a new friend request after cancelling the previous one', async () => {
		await sendFriendRequest(user1, user2.id);
		await cancelFriendRequest(user1, user2.id);
		const newRequest = (await sendFriendRequest(
			user1,
			user2.id,
		)) as FriendRequestRecord;
		expect(newRequest.requesterId).toBe(user1.id);
		expect(newRequest.addresseeId).toBe(user2.id);
	});
});
