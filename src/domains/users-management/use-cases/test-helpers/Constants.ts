import type {
	CreateUser,
	FullUser,
	UpdateUserData,
	UserPrivateProfile,
	UserPublicProfile,
	UserStatus,
	UsersPage,
} from '../../use-cases/Models';

export const DEFAULT_REQUESTER_ID = 1;
export const DEFAULT_TARGET_ID = 1;
export const DEFAULT_PUBLIC_PROFILE_ID = 2;
export const DEFAULT_REQUESTER_STATUS: UserStatus = 'active';
export const DEFAULT_HASHED_PASSWORD = 'hashed_password';

export const DEFAULT_CREATE_USER_DATA: CreateUser = {
	name: 'John Doe',
	nickname: 'john_doe',
	email: 'john@olapoesia.dev',
	password: 'password123',
	avatarUrl: 'https://cdn.olapoesia.dev/avatar/john.png',
	bio: 'Poetry lover',
};

export const DEFAULT_UPDATE_USER_DATA: UpdateUserData = {
	nickname: 'john_updated',
};

export const DEFAULT_FULL_USER: FullUser = {
	id: DEFAULT_TARGET_ID,
	name: DEFAULT_CREATE_USER_DATA.name,
	nickname: DEFAULT_CREATE_USER_DATA.nickname,
	email: DEFAULT_CREATE_USER_DATA.email,
	bio: DEFAULT_CREATE_USER_DATA.bio,
	avatarUrl: DEFAULT_CREATE_USER_DATA.avatarUrl,
	role: 'author',
	status: 'active',
	createdAt: new Date('2025-01-01T00:00:00.000Z'),
	updatedAt: new Date('2025-01-01T00:00:00.000Z'),
	emailVerifiedAt: null,
};

export const DEFAULT_PRIVATE_PROFILE: UserPrivateProfile = {
	id: DEFAULT_TARGET_ID,
	nickname: DEFAULT_CREATE_USER_DATA.nickname,
	name: DEFAULT_CREATE_USER_DATA.name,
	bio: DEFAULT_CREATE_USER_DATA.bio,
	avatarUrl: DEFAULT_CREATE_USER_DATA.avatarUrl,
	role: 'author',
	status: 'active',
	email: DEFAULT_CREATE_USER_DATA.email,
	emailVerifiedAt: null,
	stats: {
		poemsIds: [11, 12],
		commentsIds: [21],
		friendsIds: [31],
	},
	friendshipRequestsSent: [],
	friendshipRequestsReceived: [],
	blockedUsersIds: [],
};

export const DEFAULT_PUBLIC_PROFILE: UserPublicProfile = {
	id: DEFAULT_PUBLIC_PROFILE_ID,
	nickname: 'mary',
	name: 'Mary Doe',
	bio: 'Write, read, repeat',
	avatarUrl: 'https://cdn.olapoesia.dev/avatar/mary.png',
	role: 'author',
	status: 'active',
	stats: {
		poemsCount: 3,
		commentsCount: 9,
		friendsCount: 4,
	},
	isFriend: false,
	hasBlockedRequester: false,
	isBlockedByRequester: false,
	isFriendRequester: false,
};

export const DEFAULT_USERS_PAGE: UsersPage = {
	users: [
		{
			id: 1,
			nickname: 'john',
			avatarUrl: 'https://cdn.olapoesia.dev/avatar/john.png',
			role: 'author',
		},
	],
	nextCursor: 1,
	hasMore: false,
};
