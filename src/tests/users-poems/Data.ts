import type {
	UpdatePoem,
	CreatePoem,
} from '@Domains/poems-management/use-cases/commands/Models';
import type { CreateUser } from '@Domains/users-management/use-cases/commands/Index';

export const testUsersData: CreateUser[] = [
	{
		email: 'user1@gmail.com',
		password: 'password',
		nickname: 'user1',
		name: 'User One',
		bio: 'Bio of User One',
		avatarUrl: 'http://example.com/avatar1.png',
	},
	{
		email: 'user2@gmail.com',
		password: 'password',
		nickname: 'user2',
		name: 'User Two',
		bio: 'Bio of User Two',
		avatarUrl: 'http://example.com/avatar2.png',
	},
	{
		email: 'user3@gmail.com',
		password: 'password',
		nickname: 'user3',
		name: 'User Three',
		bio: 'Bio of User Three',
		avatarUrl: 'http://example.com/avatar3.png',
	},
];

export const testPoemsData: CreatePoem[] = [
	{
		title: 'The Dawn',
		content: 'The sun rises over the hills...',
		excerpt: 'A poem about dawn.',
		tags: ['nature', 'morning'],
	},
	{
		title: 'Silent Night',
		content: 'The world sleeps under a blanket of stars...',
		excerpt: 'A poem about night.',
		tags: ['night', 'stars'],
	},
	{
		title: 'Winds of Change',
		content: 'The winds whisper tales of old...',
		excerpt: 'A poem about change.',
		tags: ['change', 'wind'],
	},
];

export const testPoemsForUpdate: UpdatePoem[] = [
	{
		title: 'The Dawn - Revised',
		content: 'The golden sun ascends the hills...',
		excerpt: 'A revised poem about dawn.',
		tags: ['nature', 'morning', 'sunrise'],
		isCommentable: true,
		visibility: 'public',
		status: 'published',
	},
	{
		title: 'Silent Night - Extended',
		content: 'The world sleeps under a blanket of stars and dreams...',
		excerpt: 'An extended poem about night.',
		tags: ['night', 'stars', 'dreams'],
		isCommentable: false,
		visibility: 'private',
		status: 'draft',
	},
	{
		title: 'Winds of Change - Final',
		content: 'The winds whisper tales of old and new beginnings...',
		excerpt: 'The final version of a poem about change.',
		tags: ['change', 'wind', 'new beginnings'],
		isCommentable: true,
		visibility: 'public',
		status: 'published',
	},
];
