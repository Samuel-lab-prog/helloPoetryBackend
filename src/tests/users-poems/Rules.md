# Poems Management - Business Component (BC)

This module manages poems. Does not include interaction with comments or
likes.  
All rules have been validated through integration tests covering complex
scenarios.

---

## 🔹 Core Features

- Create, edit, and delete poems.
- Manage poem metadata such as title, tags, slug, and publication status.
- Ensure data integrity and consistency.
- Ensure correct view permissions based on user roles and relationships.
- Support poem dedications to other users or poems.
- Apply moderation rules and sanctions where applicable.

---

## ✅ Validation Rules

### 1. Poems Management

- Users **cannot see private poems** of other users.
- Users **cannot see friends-only poems** if they are not friends.
- Users **cannot edit or delete poems** they do not own.
- Users **cannot create poems** with invalid data (e.g., empty title, content,
  or missing required fields).
- Users **cannot publish poems** without a unique slug per author.
- Deleted poems **are no longer accessible**.
- Edited poems **reflect the latest changes** immediately.

### 2. Visibility and Access

- Poems with **status `draft` or `scheduled`** are only visible to the author.
- Poems with **visibility `private`** are only accessible to the author.
- Poems with **visibility `friends`** are only visible to the author’s friends.
- Poems with **visibility `unlisted`** are accessible only via direct link
  (slug).
- Users with **sanctions** (suspension or ban) cannot create, edit, or delete
  poems during the sanction period.

### 3. Moderation Rules

- Poems with **moderationStatus `pending`** are visible only to moderators and
  the author.
- Poems with **moderationStatus `rejected` or `removed`** are not visible to
  general users.

### 4. Dedications

- Poems can be **dedicated to a user** (`toUser`).
  - Dedication users **must exist**.
  - Users **cannot see dedications** to private poems if they do not have
    access.
- Poems can be **dedicated to another poem** (`toPoem`).
  - Target poems **must exist** and **must be accessible** to the user creating
    the dedication.

### 5. Tags

- Users can **assign multiple tags** to poems.
