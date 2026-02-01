# Friends Management - Business Component (BC)

This module manages **friendships**, **friend requests**, and **user blocks**.  
All rules have been validated through integration tests covering complex
scenarios.

---

## 🔹 Core Features

- Send, accept, reject, and cancel friend requests.
- Block and unblock users.
- Ensure relationship integrity and data consistency.

---

## ✅ Validation Rules

### 1. Friend Requests

- Users **cannot send friend requests** to users who have blocked them.
- Users **cannot send friend requests** to users they have blocked.
- Users **cannot accept friend requests** from users they have blocked.
- Users **cannot accept friend requests** from users who have blocked them.
- Users **cannot see the same request** multiple times in their pending requests
  list.
- Rejected requests **no longer appear** in the pending requests list.
- Canceled requests **no longer appear** in the pending requests list.
- Requests from blocked users **do not appear** in the pending requests list.

### 2. Request Actions

- Users **cannot accept a request** that has already been accepted.
- Users **cannot reject a request** that has already been rejected.
- Users **cannot cancel a request** that has already been canceled.
- Users **cannot block the same user** multiple times.

### 3. Friendship Consistency

- Blocking a user **removes any existing friendship** between the two users.
- Deleting a friendship **removes the connection** in both users’ friends lists.
- Unblocking a user **does not restore friendships automatically**.

---

## ⚡ Testing Status

- All rules above are **covered by integration tests**.
- Edge cases like simultaneous requests, blocking while pending, and duplicate
  actions are handled.
- A small **end-to-end test** is recommended to validate CORS and request flow.

---

## 📝 Notes

- All operations are transactional to maintain **data consistency**.
- Errors are logged and normalized using a central **error handler**.
- Response codes follow **REST conventions**: `400`, `403`, `404`, `409`, `422`,
  `500`.
