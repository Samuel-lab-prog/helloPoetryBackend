# 🧪 Integration Tests Context – Friends & Blocking Domain

Use this file as **context input** whenever asking ChatGPT to generate new
integration tests for this project.

---

## 📌 Stack

- Runtime: Bun
- Test runner: bun:test
- HTTP Framework: Elysia
- Architecture: Clean Architecture (Router → UseCase → Repository → Prisma)

---

## 🧠 Canonical Domain Vocabulary

Always use these names:

- requesterId → user who sends a request
- addresseeId → user who receives a request

Never use:

- fromUserId
- toUserId

These names must be consistent across:

- Router
- Use case
- Repository
- Prisma models
- Tests

---

## 🧑‍🤝‍🧑 Friend Request Domain Rules

### Send Friend Request

- requester → sends
- addressee → receives

Helper:

sendFriendRequest(fromUser, addresseeId)

---

### Cancel Friend Request

- Only requester can cancel
- Request must be pending

Helper:

cancelFriendRequest(requesterUser, addresseeId)

---

### Accept Friend Request

- Only addressee can accept

Helper:

acceptFriendRequest(addresseeUser, requesterId)

---

### Reject Friend Request

- Only addressee can reject

Helper:

rejectFriendRequest(addresseeUser, requesterId)

---

### Delete Friend

- Either friend can delete

Helper:

deleteFriend(user, friendUserId)

---

## ⛔ Blocking Domain Rules

### Block User

- Any user can block another
- Blocking creates a record using:
  - requesterId = blocker
  - addresseeId = blocked user

Helper:

blockUser(byUser, targetUserId)

---

### Unblock User

Helper:

unblockUser(byUser, targetUserId)

---

### Effects of Blocking

If A blocks B:

- A cannot send friend request to B
- B cannot send friend request to A
- B does not appear in A friends list
- B appears in A blockedUsersIds

---

## 🔁 State Transition Summary

Send → Cancel → (Requester) Send → Accept → (Addressee) Send → Reject →
(Addressee) Accept → Delete Friend → (Either) Any → Block → (Either) Block →
Unblock → (Blocker)

---

## 🧪 Test Structure Pattern

beforeEach:

- clearDatabase()
- create user1
- create user2
- login user1
- login user2

---

## ✅ Success Case Pattern

it('description', async () => { const result = await action(...)
expect(result.requesterId).toBe(...) expect(result.addresseeId).toBe(...) });

---

## ❌ Error Case Pattern

it('description', async () => { const result = await action(...) expect((result
as AppError).statusCode).toBe(403 | 404 | 409) });

Never expect thrown errors. All endpoints return JSON.

---

## 🧰 Available Helpers

createUser(data) loginUser(user) sendFriendRequest(from, addresseeId)
acceptFriendRequest(to, requesterId) rejectFriendRequest(to, requesterId)
cancelFriendRequest(from, addresseeId) blockUser(by, targetUserId)
unblockUser(by, targetUserId) deleteFriend(user, friendUserId)
getMyPrivateProfile(user)

---

## 📦 Returned Models

### FriendRequest

{ requesterId: number addresseeId: number }

### PrivateProfile

{ stats: { friendsIds: number[] } blockedUsersIds: number[] }

---

## 🚨 Common Mistakes to Avoid

❌ Passing addressee as canceller ❌ Mixing requesterId/addresseeId with
fromUserId/toUserId ❌ Expecting thrown exceptions ❌ Asserting entire objects
instead of key fields

---

## 🎯 Goal of Tests

- Validate business rules
- Validate permissions
- Validate state transitions
- Not to test Prisma internals

---

## 📎 Instruction to ChatGPT When Using This File

"Using this context, generate integration tests following the same patterns and
respecting all domain rules above."
