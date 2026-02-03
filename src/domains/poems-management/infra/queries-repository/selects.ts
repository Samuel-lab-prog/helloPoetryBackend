import type { PoemSelect } from '@PrismaGenerated/models';

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
			id: true,
			name: true,
		},
	},

	dedications: {
		select: {
			toUser: {
				select: {
					id: true,
					name: true,
					nickname: true,
					avatarUrl: true,
					friendshipsFrom: {
						select: {
							userBId: true,
							userAId: true,
						},
					},
					friendshipsTo: {
						select: {
							userAId: true,
							userBId: true,
						},
					},
				},
			},
		},
	},

	_count: {
		select: {
			poemLikes: true,
			comments: true,
		},
	},
} as const satisfies PoemSelect;

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
	moderationStatus: true,

	author: {
		select: {
			id: true,
			name: true,
			nickname: true,
			avatarUrl: true,
			friendshipsFrom: {
				select: {
					userBId: true,
					userAId: true,
				},
			},
			friendshipsTo: {
				select: {
					userAId: true,
					userBId: true,
				},
			},
		},
	},

	tags: {
		select: {
			id: true,
			name: true,
		},
	},

	dedications: {
		select: {
			toUser: {
				select: {
					id: true,
					name: true,
					nickname: true,
					avatarUrl: true,
					friendshipsFrom: {
						select: {
							userBId: true,
							userAId: true,
						},
					},
					friendshipsTo: {
						select: {
							userAId: true,
							userBId: true,
						},
					},
				},
			},
		},
	},

	_count: {
		select: {
			poemLikes: true,
			comments: true,
		},
	},
} as const satisfies PoemSelect;

export const insertPoemSelect = {
	id: true,
	slug: true,
	title: true,
	content: true,
	excerpt: true,
} as const satisfies PoemSelect;
