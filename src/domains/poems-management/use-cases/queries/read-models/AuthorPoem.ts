export interface AuthorPoem {
	id: number;
	title: string;
	content: string;
	createdAt: Date;

	author: {
		id: number;
		name: string;
		nickname: string;
	};

	stats: {
		likesCount: number;
		commentsCount: number;
	};
}
