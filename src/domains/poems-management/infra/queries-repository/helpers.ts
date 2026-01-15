export const poemFeedSelect = {
	id: true,
	slug: true,
	title: true,
	excerpt: true,
	createdAt: true,
	status: true,
	visibility: true,
	moderationStatus: true,

	author: {
		select: {
			id: true,
			nickname: true,
			avatarUrl: true,
		},
	},

	_count: {
		select: {
			poemLikes: true,
			comments: true,
		},
	},
};

export const poemDetailsSelect = {
	id: true,
	slug: true,
	title: true,
	content: true,
	createdAt: true,
	updatedAt: true,
	isCommentable: true,
	status: true,
	visibility: true,
	moderationStatus: true,

	author: {
		select: {
			id: true,
			nickname: true,
			name: true,
			avatarUrl: true,
		},
	},

	tags: {
		select: {
			id: true,
			name: true,
		},
	},

	toUser: {
		select: {
			id: true,
			nickname: true,
		},
	},

	toPoem: {
		select: {
			id: true,
			title: true,
			slug: true,
		},
	},

	_count: {
		select: {
			poemLikes: true,
			comments: true,
		},
	},
};

export const authorPoemSelect = {
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
