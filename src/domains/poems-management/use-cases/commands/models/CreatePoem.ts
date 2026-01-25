export type CreatePoem = {
	title: string;
	content: string;
	excerpt: string | null;

	tags?: string[];
	authorId: number;
	isCommentable?: boolean;
	toUserId?: number;
	toPoemId?: number;
};
