You are a skilled software engineer helping me write integration tests for my
codebase. Use this file as context for writing those tests.

---

## 📌 Stack and file structure

- Runtime: Bun
- Test runner: bun:test
- HTTP Framework: Elysia
- Architecture: Clean Architecture (Router → UseCase → Repository → Prisma)
- Database ORM: Prisma
- Database: PostgreSQL
- File structure:

````plaintext
join('adapters/http/queries', 'Services.ts'),
	join('adapters/http/queries', 'QueriesRouter.ts'),
	join('adapters/http/queries', 'QueriesRouter.test.ts'),
	join('adapters/http/commands', 'Services.ts'),
	join('adapters/http/commands', 'CommandsRouter.ts'),
	join('adapters/http/commands', 'CommandsRouter.test.ts'),
	join('adapters/schemas', 'Index.ts'),

	join('infra/queries-repository', 'Repository.ts'),
	join('infra/queries-repository', 'Repository.test.ts'),
	join('infra/commands-repository', 'Repository.ts'),
	join('infra/commands-repository', 'Repository.test.ts'),

	join('use-cases/queries/', 'Errors.ts'),
	join('use-cases/queries/', 'Index.ts'),
	join('use-cases/queries/models', 'Index.ts'),
	join('use-cases/commands/', 'Index.ts'),
	join('use-cases/commands/', 'Errors.ts'),
	join('use-cases/commands/models', 'Index.ts'),

	join('ports', 'QueriesRepository.ts'),
	join('ports', 'CommandsRepository.ts'),
  join('tests/(user-friends, poems-moderation etc)', 'Setup.ts'),
---

## 🧠 Database Models
  - User
  - Friendship
  - FriendshipRequest
  - BlockedFriend
  - Comment
  - CommentLike
  - Poem
  - PoemLike
  - Tag
  - UserSanction
---

## 🎯 Goal of Tests

- Validate business rules
- Validate permissions
- Catch edge cases
- Validate state transitions
- Not to test Prisma internals
- Not to test Elysia internals

---

## ⚙️ Test Setup
- Each folder of integraion tests has a Helpers.ts file to setup the test environment.
- Helpers.ts files contain functions to:
  - Initialize and teardown the test database.
  - Create mock data (users, poems, comments, friendships, etc.).
  - Authenticate users and generate tokens.
  - Make HTTP requests to the Elysia app.

  Example:
```ts
import { Elysia } from 'elysia';
import { server } from '../../index';

export const app = new Elysia().use(server);
export const PREFIX = 'http://test/api/v1';

export interface TestUser {
	id: number;
	cookie: string;
	email: string;
	password: string;
}

function jsonRequest(
	url: string,
	options: Omit<RequestInit, 'body'> & { body?: unknown } = {},
) {
	return new Request(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
}

/**
 * Create a user via API
 */
export async function createUser(data: {
	email: string;
	password: string;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string;
}): Promise<TestUser> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users`, {
			method: 'POST',
			body: data,
		}),
	);
	const body = (await res.json()) as any;
	return {
		id: body.id,
		cookie: '',
		email: data.email,
		password: data.password,
	};
}

/**
 * Log in a user and return the HTTP cookie
 */
export async function loginUser(user: TestUser): Promise<TestUser> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/auth/login`, {
			method: 'POST',
			body: { email: user.email, password: user.password },
		}),
	);
	const cookie = res.headers.get('set-cookie');
	return { ...user, cookie: cookie || '' };
}

/**
 * Send a friend request from one user to another
 */
export async function sendFriendRequest(from: TestUser, addresseeId: number) {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/friends/${addresseeId}`, {
			method: 'POST',
			headers: { Cookie: from.cookie },
		}),
	);
	return await res.json();
}
````

### 📎 Integration test example

import { describe, it, beforeEach, expect } from 'bun:test'; import {
clearDatabase } from '@GenericSubdomains/utils/ClearDatabase'; import {
createUser, loginUser, sendFriendRequest, cancelFriendRequest, type TestUser, }
from './Helpers'; import type { FriendRequest } from
'@Domains/friends-management/use-cases/commands/models/FriendRequest'; import
type { AppError } from '@AppError';

let user1: TestUser; let user2: TestUser;

beforeEach(async () => { await clearDatabase(); user1 = await createUser({
email: 'user1@example.com', password: 'password1', nickname: 'user1', name:
'User One', bio: 'Bio of User One', avatarUrl: 'http://example.com/avatar1.png',
}); user2 = await createUser({ email: 'user2@example.com', password:
'password2', nickname: 'user2', name: 'User Two', bio: 'Bio of User Two',
avatarUrl: 'http://example.com/avatar2.png', }); user1 = await loginUser(user1);
user2 = await loginUser(user2); });

describe('INTEGRATION - Friends Requests cancellation', () => { it('User1 sends
a friend request to User2', async () => { const request = (await
sendFriendRequest(user1, user2.id)) as FriendRequest;
expect(request.requesterId).toBe(user1.id);
expect(request.addresseeId).toBe(user2.id); });

    it('User1 cancels the friend request to User2', async () => {
    	await sendFriendRequest(user1, user2.id);

    	const cancelled = (await cancelFriendRequest(
    		user1,
    		user2.id,
    	)) as FriendRequest;

    	expect(cancelled.requesterId).toBe(user1.id);
    	expect(cancelled.addresseeId).toBe(user2.id);
    });

    it('User1 cannot cancel the same friend request again', async () => {
    	await sendFriendRequest(user1, user2.id);

    	const firstReq = await cancelFriendRequest(user1, user2.id);
    	const secondReq = await cancelFriendRequest(user1, user2.id);

    	expect(firstReq).not.toEqual(secondReq);
    	expect((secondReq as AppError).statusCode).toEqual(404);
    });
