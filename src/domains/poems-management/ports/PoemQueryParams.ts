export type SelectPoemPageParams = {
	viewerId?: number;
	limit: number;
	cursor?: number;
};

export type SelectPoemDetailsParams = {
	poemId: number;
	viewerId?: number;
};

export type SelectPoemsByAuthorParams = {
	authorId: number;
	viewerId?: number;
	limit: number;
	cursor?: number;
};

export type SelectAuthorPoemParams = {
	poemId: number;
};

export type SelectAuthorPoemListParams = {
	authorId: number;
};
