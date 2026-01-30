import type { FullPoem } from '../models/FullPoem';
import type { AuthorPoem } from '../models/AuthorPoem';
import type { MyPoem } from '../models/MyPoem';

export function toAuthorPoem(fullPoem: FullPoem): AuthorPoem {
	return {
		id: fullPoem.id,
		title: fullPoem.title,
		content: fullPoem.content,
		createdAt: fullPoem.createdAt,
		status: fullPoem.status,
		visibility: fullPoem.visibility,
		author: {
			id: fullPoem.author.id,
			name: fullPoem.author.name,
			nickname: fullPoem.author.nickname,
			avatarUrl: fullPoem.author.avatarUrl,
			friendsIds: fullPoem.author.friendsIds,
		},
		stats: {
			likesCount: fullPoem.stats.likesCount,
			commentsCount: fullPoem.stats.commentsCount,
		},
	};
}

export function toMyPoem(fullPoem: FullPoem): MyPoem {
	return {
		id: fullPoem.id,
		title: fullPoem.title,
		slug: fullPoem.slug,
		moderationStatus: fullPoem.moderationStatus,
		content: fullPoem.content,
		excerpt: fullPoem.excerpt ?? null,
		createdAt: fullPoem.createdAt,
		updatedAt: fullPoem.updatedAt,
		status: fullPoem.status,
		visibility: fullPoem.visibility,
		isCommentable: fullPoem.isCommentable,
		tags: fullPoem.tags,
		stats: {
			likesCount: fullPoem.stats.likesCount,
			commentsCount: fullPoem.stats.commentsCount,
		},
	};
}
