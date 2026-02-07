import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import { sendFriendRequest, acceptFriendRequest, deleteFriend } from './Utils';
import { createUser, type TestUser, loginUser } from '../Helpers';

import type { AppError } from '@AppError';
import type {
	FriendRequestRecord,
	FriendshipRecord,
	RemovedFriendRecord,
} from '@Domains/friends-management/use-cases/Models';

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
	it('Users can become friends via friend request and acceptance', async () => {
		const request = (await sendFriendRequest(
			user1,
			user2.id,
		)) as FriendRequestRecord;
		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);

		const accepted = (await acceptFriendRequest(
			user2,
			user1.id,
		)) as FriendshipRecord;
		expect(accepted.userAId).toBe(user1.id);
		expect(accepted.userBId).toBe(user2.id);
	});

	it('User1 can delete User2 from friends', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		expect(
			(await deleteFriend(user1, user2.id)) as RemovedFriendRecord,
		).toEqual(
			expect.objectContaining({
				removedById: user1.id,
				removedId: user2.id,
			}),
		);
	});

	it('User1 cannot delete User2 again after deletion', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);

		await deleteFriend(user1, user2.id);

		const result = await deleteFriend(user1, user2.id);
		expect((result as AppError).statusCode).toBe(404);
	});

	it('User2 cannot delete User1 if they are not friends', async () => {
		const result = await deleteFriend(user2, user1.id);
		expect((result as AppError).statusCode).toBe(404);
	});

	it('Friendship can be recreated after deletion', async () => {
		await sendFriendRequest(user1, user2.id);
		await acceptFriendRequest(user2, user1.id);
		await deleteFriend(user1, user2.id);

		(await sendFriendRequest(user1, user2.id)) as FriendRequestRecord;
		const accepted = (await acceptFriendRequest(
			user2,
			user1.id,
		)) as FriendshipRecord;
		expect(accepted.userAId).toBe(user1.id);
		expect(accepted.userBId).toBe(user2.id);
	});
});
