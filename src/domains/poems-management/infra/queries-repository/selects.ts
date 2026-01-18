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

export const authorPoemSelect = {
	id: true,
	slug: true,
	title: true,
	content: true,
	excerpt: true,
	isCommentable: true,
	createdAt: true,
	status: true,
	visibility: true,

	author: {
		select: {
			id: true,
			name: true,
			nickname: true,
			avatarUrl: true,
			friendshipsTo: {
				where: { status: 'accepted' },
				select: { userAId: true },
			},
			friendshipsFrom: {
				where: { status: 'accepted' },
				select: { userBId: true },
			},
		},
	},

	tags: {
		select: {
			id: true,
			name: true,
		},
	},

	_count: {
		select: {
			poemLikes: true,
			comments: true,
		},
	},
} as const;

export const fullPoemSelect = {
	id: true,
	slug: true,
	title: true,
	content: true,
	excerpt: true,
	isCommentable: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	status: true,
	visibility: true,
	moderationStatus: true,
	author: {
		select: {
			id: true,
			name: true,
			nickname: true,
			avatarUrl: true,
			friendshipsFrom: { select: { userBId: true } },
			friendshipsTo: { select: { userAId: true } },
		},
	},
	toUser: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
	toPoem: { select: { id: true, title: true, slug: true, authorId: true } },
	tags: { select: { id: true, name: true } },
	_count: { select: { poemLikes: true, comments: true } },
} as const;
