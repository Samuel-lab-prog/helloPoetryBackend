import type { poemVisibility, poemStatus } from './Enums';

export interface AuthorPoem {
	id: number;
	title: string;
	content: string;
	createdAt: Date;

	status: poemStatus;
	visibility: poemVisibility;

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
