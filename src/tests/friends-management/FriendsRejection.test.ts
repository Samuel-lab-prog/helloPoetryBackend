import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import {
	sendFriendRequest,
	rejectFriendRequest,
	getMyPrivateProfile,
	acceptFriendRequest,
} from '../endpoints/Users';
import { createUser, type TestUser, loginUser } from '../Helpers';
import type {
	FriendRequestRejectionRecord,
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
	it('User1 sends a friend request to User2', async () => {
		const request = (await sendFriendRequest(
			user1,
			user2.id,
		)) as FriendRequestRecord;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});

	it('User2 rejects the friend request from User1', async () => {
		await sendFriendRequest(user1, user2.id);

		const rejected = (await rejectFriendRequest(
			user2,
			user1.id,
		)) as FriendRequestRejectionRecord;

		expect(rejected.rejectedId).toBe(user2.id);
		expect(rejected.rejecterId).toBe(user1.id);
	});

	it('User2 cannot reject the same friend request again', async () => {
		await sendFriendRequest(user1, user2.id);

		await rejectFriendRequest(user2, user1.id);
		const secondReq = await rejectFriendRequest(user2, user1.id);

		expect((secondReq as AppError).statusCode).toEqual(404);
	});

	it('Requester cannot reject its own friend request', async () => {
		await sendFriendRequest(user1, user2.id);

		const res = await rejectFriendRequest(user1, user2.id);

		expect((res as AppError).statusCode).toEqual(404);
	});

	it('Rejected request no longer appears in users/me for User2', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);

		const me = (await getMyPrivateProfile(user2)) as UserPrivateProfile;

		expect(
			me.friendshipRequestsReceived.some((r) => r.requesterId === user1.id),
		).toBe(false);
	});

	it('Rejected request no longer appears in users/me for User1', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);

		const me = (await getMyPrivateProfile(user1)) as UserPrivateProfile;

		expect(
			me.friendshipRequestsSent.some((r) => r.addresseeId === user2.id),
		).toBe(false);
	});

	it('Rejected request cannot be accepted later', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);

		const res = await acceptFriendRequest(user2, user1.id);

		expect((res as AppError).statusCode).toEqual(404);
	});

	it('After rejection, requester can send a new friend request', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);

		const newReq = (await sendFriendRequest(
			user1,
			user2.id,
		)) as FriendRequestRecord;

		expect(newReq.requesterId).toBe(user1.id);
		expect(newReq.addresseeId).toBe(user2.id);
	});

	it('Rejection does not create friendship', async () => {
		await sendFriendRequest(user1, user2.id);
		await rejectFriendRequest(user2, user1.id);

		const me1 = (await getMyPrivateProfile(user1)) as UserPrivateProfile;
		const me2 = (await getMyPrivateProfile(user2)) as UserPrivateProfile;

		expect(me1.stats.friendsIds.includes(user2.id)).toBe(false);
		expect(me2.stats.friendsIds.includes(user1.id)).toBe(false);
	});
});
