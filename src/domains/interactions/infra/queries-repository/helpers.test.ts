import { beforeEach, describe, expect, it, mock } from 'bun:test';

const findUniqueComment = mock(() => Promise.resolve(null as unknown));
const countComments = mock(() => Promise.resolve(0));
const findManyComments = mock(() => Promise.resolve([] as unknown[]));
const groupReplies = mock(() => Promise.resolve([] as unknown[]));
const countLikes = mock((_args: Record<string, unknown>) => Promise.resolve(0));
const findUniqueLike = mock(() => Promise.resolve(null as unknown));
const groupLikes = mock((_args: Record<string, unknown>) =>
	Promise.resolve([] as unknown[]),
);
const findManyLikes = mock(() => Promise.resolve([] as unknown[]));

mock.module('@Prisma/PrismaClient', () => ({
	prisma: {
		comment: {
			findUnique: findUniqueComment,
			count: countComments,
			findMany: findManyComments,
			groupBy: groupReplies,
		},
		commentLike: {
			count: countLikes,
			findUnique: findUniqueLike,
			groupBy: groupLikes,
			findMany: findManyLikes,
		},
		poemLike: { findUnique: mock(() => Promise.resolve(null)) },
	},
}));

mock.module('@PrismaErrorHandler', () => ({
	withPrismaErrorHandling: (callback: () => Promise<unknown>) => callback(),
}));

const { selectCommentById, selectCommentsByPoemId } = await import(
	'./repository'
);

const visibleComment = {
	id: 17,
	content: 'A comment',
	authorId: 31,
	poemId: 52,
	createdAt: new Date('2026-10-19T12:00:00.000Z'),
	parentId: null,
	status: 'visible',
	author: {
		id: 31,
		nickname: 'poet',
		avatarUrl: null,
		status: 'active',
	},
};

describe('interactions queries repository comment like projections', () => {
	beforeEach(() => {
		findUniqueComment.mockReset();
		countComments.mockReset();
		findManyComments.mockReset();
		groupReplies.mockReset();
		countLikes.mockReset();
		findUniqueLike.mockReset();
		groupLikes.mockReset();
		findManyLikes.mockReset();
		findUniqueComment.mockResolvedValue(visibleComment);
		countComments.mockResolvedValue(2);
		countLikes.mockResolvedValue(3);
		findUniqueLike.mockResolvedValue({
			userId: 8,
			commentId: visibleComment.id,
		});
		findManyComments.mockResolvedValue([visibleComment]);
		groupReplies.mockResolvedValue([
			{ parentId: visibleComment.id, _count: { id: 2 } },
		]);
		groupLikes.mockResolvedValue([
			{ commentId: visibleComment.id, _count: { userId: 3 } },
		]);
		findManyLikes.mockResolvedValue([{ commentId: visibleComment.id }]);
	});

	it('counts only public-user likes and reports the authenticated viewer state', async () => {
		const projected = await selectCommentById({
			commentId: visibleComment.id,
			currentUserId: 8,
		});

		expect(projected).toMatchObject({
			likesCount: 3,
			likedByCurrentUser: true,
		});
		expect(countLikes).toHaveBeenCalledWith({
			where: {
				commentId: visibleComment.id,
				user: { status: { not: 'banned' } },
			},
		});
	});

	it('reports an unliked state when no current user is supplied', async () => {
		const projected = await selectCommentById({ commentId: visibleComment.id });

		expect(projected?.likedByCurrentUser).toBe(false);
		expect(findUniqueLike).not.toHaveBeenCalled();
	});

	it('uses the same banned-liker count policy in individual and list projections', async () => {
		const individual = await selectCommentById({
			commentId: visibleComment.id,
			currentUserId: 8,
		});
		const listed = await selectCommentsByPoemId({
			poemId: visibleComment.poemId,
			currentUserId: 8,
			viewerStatus: 'active',
			limit: 10,
		});

		expect(individual?.likesCount).toBe(listed.comments[0]?.likesCount);
		expect(individual?.likedByCurrentUser).toBe(
			listed.comments[0]?.likedByCurrentUser,
		);
		expect(countLikes.mock.calls[0]?.[0]).toMatchObject({
			where: { user: { status: { not: 'banned' } } },
		});
		expect(groupLikes.mock.calls[0]?.[0]).toMatchObject({
			where: { user: { status: { not: 'banned' } } },
		});
		expect(listed.comments[0]).toMatchObject({
			likesCount: 3,
			likedByCurrentUser: true,
		});
	});

	it('excludes banned likers from the list count while retaining the current active viewer state', async () => {
		groupLikes.mockResolvedValue([
			{ commentId: visibleComment.id, _count: { userId: 1 } },
		]);
		findManyLikes.mockResolvedValue([{ commentId: visibleComment.id }]);

		const listed = await selectCommentsByPoemId({
			poemId: visibleComment.poemId,
			currentUserId: 8,
			viewerStatus: 'active',
		});

		expect(groupLikes.mock.calls[0]?.[0]).toMatchObject({
			where: { user: { status: { not: 'banned' } } },
		});
		expect(listed.comments[0]).toMatchObject({
			likesCount: 1,
			likedByCurrentUser: true,
		});
	});
});
