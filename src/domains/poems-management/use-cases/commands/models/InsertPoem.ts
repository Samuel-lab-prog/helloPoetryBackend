export type InsertPoem = {
	title: string;
	content: string;
	slug: string;
	excerpt: string | null;

	tags?: string[];
	authorId: number;
	isCommentable?: boolean;
	toUserId?: number;
	toPoemId?: number;
};
