import type { PoemVisibility, PoemStatus } from './Enums';

export interface AuthorPoem {
	id: number;
	title: string;
	content: string;
	createdAt: Date;

	status: PoemStatus;
	visibility: PoemVisibility;

	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string;
		friendsIds: number[];
	};

	stats: {
		likesCount: number;
		commentsCount: number;
	};
}
