import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { givenResolved } from '@TestUtils';

import type { AuthorPoem, MyPoem } from '../../ports/Models';
import type { PoemsSutMocks } from './SutMocks';
import {
	DEFAULT_AUTHOR_ID,
	DEFAULT_POEM_CONTENT,
	DEFAULT_POEM_EXCERPT,
	DEFAULT_POEM_ID,
	DEFAULT_POEM_MODERATION_STATUS,
	DEFAULT_POEM_SLUG,
	DEFAULT_POEM_STATUS,
	DEFAULT_POEM_TAGS,
	DEFAULT_POEM_TITLE,
	DEFAULT_POEM_VISIBILITY,
	DEFAULT_REQUESTER_ID,
	DEFAULT_USER_NICKNAME,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
} from './Constants';
import type { PoemPreviewPage } from '@Domains/poems-management/ports/Models';

export type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersPublicContract['selectUserBasicInfo']>>
>;
export type AuthorPoemOverride = Partial<
	Omit<AuthorPoem, 'author' | 'stats'>
> & {
	author?: Partial<AuthorPoem['author']>;
	stats?: Partial<AuthorPoem['stats']>;
};
export type MyPoemOverride = Partial<MyPoem>;
export type SelectPoemByIdOverride = AuthorPoemOverride;

export function makeAuthorPoem(overrides: AuthorPoemOverride = {}): AuthorPoem {
	const { author, stats, ...rest } = overrides;

	return {
		id: DEFAULT_POEM_ID,
		title: DEFAULT_POEM_TITLE,
		slug: DEFAULT_POEM_SLUG,
		content: DEFAULT_POEM_CONTENT,
		excerpt: DEFAULT_POEM_EXCERPT,
		tags: DEFAULT_POEM_TAGS.map((name, index) => ({ id: index + 1, name })),
		status: DEFAULT_POEM_STATUS,
		visibility: DEFAULT_POEM_VISIBILITY,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		isCommentable: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		toUsers: [],
		author: {
			id: DEFAULT_AUTHOR_ID,
			name: 'Author Name',
			nickname: DEFAULT_USER_NICKNAME,
			avatarUrl: null,
			friendIds: [],
			...author,
		},
		stats: {
			likesCount: 0,
			commentsCount: 0,
			...stats,
		},
		...rest,
	};
}

export function makeMyPoem(overrides: MyPoemOverride = {}): MyPoem {
	return {
		id: DEFAULT_POEM_ID,
		title: DEFAULT_POEM_TITLE,
		slug: DEFAULT_POEM_SLUG,
		content: DEFAULT_POEM_CONTENT,
		excerpt: DEFAULT_POEM_EXCERPT,
		tags: DEFAULT_POEM_TAGS.map((name, index) => ({ id: index + 1, name })),
		status: DEFAULT_POEM_STATUS,
		visibility: DEFAULT_POEM_VISIBILITY,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		isCommentable: true,
		toUsers: [],
		createdAt: new Date(),
		updatedAt: new Date(),
		stats: {
			likesCount: 0,
			commentsCount: 0,
		},
		...overrides,
	};
}

export function givenUser(
	usersContract: PoemsSutMocks['usersContract'],
	overrides: UserBasicInfoOverride = {},
) {
	givenResolved(usersContract, 'selectUserBasicInfo', {
		exists: true,
		id: DEFAULT_REQUESTER_ID,
		status: DEFAULT_USER_STATUS,
		role: DEFAULT_USER_ROLE,
		nickname: DEFAULT_USER_NICKNAME,
		...overrides,
	});
}

export function givenPoemsSelected(
	queriesRepository: PoemsSutMocks['queriesRepository'],
	poems: PoemPreviewPage = {
		poems: [makeAuthorPoem()],
		hasMore: false,
		nextCursor: null,
	},
) {
	givenResolved(queriesRepository, 'selectPoems', poems);
}

export function givenSlug(
	slugService: PoemsSutMocks['slugService'],
	slug: string = DEFAULT_POEM_SLUG,
) {
	slugService.generateSlug.mockReturnValue(slug);
}

export function givenCreatePoemResult(
	commandsRepository: PoemsSutMocks['commandsRepository'],
	poemId: number = DEFAULT_POEM_ID,
) {
	givenResolved(commandsRepository, 'insertPoem', {
		ok: true,
		data: {
			id: poemId,
			isCommentable: true,
			updatedAt: new Date(),
			createdAt: new Date(),
			content: '',
			excerpt: '',
			slug: '',
			status: 'draft',
			title: '',
			visibility: 'public',
			tags: [],
			moderationStatus: 'approved',
			toUserIds: [],
			mentionedUserIds: [],
		},
	});
}

export function givenUpdatePoemResult(
	commandsRepository: PoemsSutMocks['commandsRepository'],
	poemId: number = DEFAULT_POEM_ID,
) {
	givenResolved(commandsRepository, 'updatePoem', {
		ok: true,
		data: {
			id: poemId,
			isCommentable: true,
			updatedAt: new Date(),
			createdAt: new Date(),
			content: '',
			excerpt: '',
			slug: '',
			status: 'draft',
			title: '',
			visibility: 'public',
			tags: [],
			toUserIds: [],
			mentionedUserIds: [],
		},
	});
}

export function givenPoemById(
	queriesRepository: PoemsSutMocks['queriesRepository'],
	overrides: SelectPoemByIdOverride = {},
) {
	givenResolved(queriesRepository, 'selectPoemById', makeAuthorPoem(overrides));
}

export function givenPoemNotFound(
	queriesRepository: PoemsSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'selectPoemById', null);
}

export function givenPoemDeleted(
	commandsRepository: PoemsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'deletePoem', {
		ok: true,
		data: undefined,
	});
}

export function givenAuthorPoems(
	queriesRepository: PoemsSutMocks['queriesRepository'],
	poems: AuthorPoem[] = [makeAuthorPoem()],
) {
	givenResolved(queriesRepository, 'selectAuthorPoems', poems);
}

export function givenMyPoems(
	queriesRepository: PoemsSutMocks['queriesRepository'],
	poems: MyPoem[] = [makeMyPoem()],
) {
	givenResolved(queriesRepository, 'selectMyPoems', poems);
}
