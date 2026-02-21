import type { PoemSelect, SavedPoemSelect } from '@PrismaGenerated/models';
const tagsSelect = {
	id: true,
	name: true,
} as const;

export const savedPoemSelect = {
	poemId: true,
	createdAt: true,
	poem: {
		select: {
			title: true,
			slug: true,
		},
	},
} as const satisfies SavedPoemSelect;

export const poemPreviewSelect = {
	id: true,
	title: true,
	slug: true,
	createdAt: true,
	author: {
		select: {
			id: true,
			name: true,
			nickname: true,
			avatarUrl: true,
		},
	},
	tags: {
		select: {
			name: true,
		},
	},
};

const dedicationsSelect = {
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
} as const;

const countSelect = {
	poemLikes: true,
	comments: true,
} as const;

const authorPreviewSelect = {
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
} as const;

export const myPoemSelect = {
	id: true,

	title: true,
	slug: true,
	excerpt: true,
	tags: { select: tagsSelect },
	content: true,

	visibility: true,
	status: true,
	moderationStatus: true,

	isCommentable: true,

	createdAt: true,
	updatedAt: true,

	dedications: {
		select: dedicationsSelect,
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

	title: true,
	slug: true,
	excerpt: true,
	tags: { select: tagsSelect },
	content: true,

	status: true,
	visibility: true,
	moderationStatus: true,

	isCommentable: true,

	updatedAt: true,
	createdAt: true,

	author: { select: authorPreviewSelect },

	dedications: {
		select: dedicationsSelect,
	},

	_count: { select: countSelect },
} as const satisfies PoemSelect;
