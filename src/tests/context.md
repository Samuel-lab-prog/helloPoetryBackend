# Integration Tests Context - Friends & Users API

## 1. Project Context

- Backend uses **Elysia** framework.
- Testing framework: **Bun + bun:test**.
- The API has endpoints for:
  - Users: create, login, get profile (`users`, `auth/login`, `users/me`)
  - Friend requests: send, accept, reject (`friends/:id`, `friends/accept/:id`,
    `friends/reject/:id`)
  - User blocking: block/unblock (`users/block/:id`, `users/unblock/:id`)

- Test helpers are implemented to simplify API calls internally (without a
  running server):
  - `createUser(data)` → creates a user
  - `loginUser(user)` → logs in user and returns cookie
  - `getMe(user)` → fetches authenticated user profile
  - `sendFriendRequest(from, toUserId)` → sends friend request
  - `acceptFriendRequest(to, fromUserId)` → accepts a friend request
  - `rejectFriendRequest(to, fromUserId)` → rejects a friend request
  - `blockUser(by, targetUserId)` → blocks a user
  - `unblockUser(by, targetUserId)` → unblocks a user (optional)

## 2. Current Test Coverage

- Friend requests:
  - Sending requests
  - Preventing duplicate requests
  - Seeing sent and received requests in `users/me`
  - Accepting requests
  - Rejecting requests
  - Prevent duplicate accept/reject

- Blocking:
  - Blocking a user
  - Prevent duplicate block
  - Removing blocked user from friend list
  - Optional unblock

## 3. Types Used

```ts
type TestUser = {
  id: number;
  cookie: string;
  email: string;
  password: string;
};

type FriendRequest = {
  fromUserId: number;
  toUserId: number;
  status: 'pending' | 'accepted' | 'rejected';
};

type PrivateProfile = {
  id: number;
  email: string;
  friends: Array<{ id: number }>;
  friendshipRequestsSent: Array<{ addresseeId: number }>;
  friendshipRequestsReceived: Array<{ requesterId: number }>;
  blockedUsers: Array<{ id: number }>;
};
4. Ideas for Additional Tests
Cancel friend requests (before being accepted/rejected)

Unfriend existing friends

Block users with pending requests

Sending requests to users who blocked you

Verify users/me lists after complex sequences (send → reject → block → unblock)

Reciprocal blocking

Multiple simultaneous friend requests and interactions

Stress testing friendship request order and blocking behavior

5. Notes for ChatGPT
Always assume beforeAll cleans database and creates/logs in at least 2 users (user1 and user2).

Helpers are available in ./helpers/Index.ts.

Focus on testing social interactions: send, accept, reject, block, unblock, cancel, unfriend.

Return Bun-compatible test code with describe / it blocks.

Avoid repeating low-level HTTP handling; us
```
