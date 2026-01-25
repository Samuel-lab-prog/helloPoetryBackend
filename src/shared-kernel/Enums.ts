export type UserRole = 'user' | 'author' | 'moderator';
export type UserStatus = 'active' | 'suspended' | 'banned';

export type FriendshipStatus = 'rejected' | 'pending' | 'accepted' | 'blocked';

export type PoemStatus = 'draft' | 'published' | 'scheduled';
export type PoemVisibility = 'public' | 'private' | 'unlisted' | 'friends';
export type PoemModerationStatus =
	| 'pending'
	| 'approved'
	| 'rejected'
	| 'removed';
