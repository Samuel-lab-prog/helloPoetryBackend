import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@Prisma/ClearDatabase';
import { setupHttpUsers } from 'tests/TestsSetups.ts';
import {
	sendFriendRequest,
	acceptFriendRequest,
	deleteFriend,
	blockUser,
	unblockUser,
} from '../endpoints/Index';
import { MAX_QUERY_TIME_LIMIT } from '@TestUtils';

let user1: any;
let user2: any;
let users: any[] = [];

beforeEach(async () => {
	await clearDatabase();
	users = await setupHttpUsers();
	[user1, user2] = users;
});

describe('PERFORMANCE - Friends Management', () => {
	it('Benchmark: sendFriendRequest', async () => {
		const start = performance.now();
		await sendFriendRequest(user1.cookie, user2.id);
		const end = performance.now();
		expect(end - start).toBeLessThan(MAX_QUERY_TIME_LIMIT);
	});

	it('Benchmark: acceptFriendRequest', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		const start = performance.now();
		await acceptFriendRequest(user2.cookie, user1.id);
		const end = performance.now();
		expect(end - start).toBeLessThan(MAX_QUERY_TIME_LIMIT);
	});

	it('Benchmark: deleteFriend', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);
		const start = performance.now();
		await deleteFriend(user1.cookie, user2.id);
		const end = performance.now();
		expect(end - start).toBeLessThan(MAX_QUERY_TIME_LIMIT);
	});

	it('Benchmark: block and unblock user', async () => {
		const startBlock = performance.now();
		await blockUser(user1.cookie, user2.id);
		const endBlock = performance.now();

		const startUnblock = performance.now();
		await unblockUser(user1.cookie, user2.id);
		const endUnblock = performance.now();

		expect(endBlock - startBlock).toBeLessThan(MAX_QUERY_TIME_LIMIT);
		expect(endUnblock - startUnblock).toBeLessThan(MAX_QUERY_TIME_LIMIT);
	});
});
