export const myPoemSelect = {
	id: true,
	slug: true,
	title: true,
	status: true,
	visibility: true,
	content: true,
	excerpt: true,
	isCommentable: true,
	moderationStatus: true,
	createdAt: true,
	updatedAt: true,
	tags: {
		select: {
			name: true,
			id: true,
		},
	},
	_count: {
		select: {
			poemLikes: true,
			comments: true,
		},
	},
} as const;
