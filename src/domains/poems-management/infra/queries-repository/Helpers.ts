/* eslint-disable @typescript-eslint/no-explicit-any */

function getFriendIdsFromRelations(user: {
	friendshipsFrom?: { userBId: number }[] | null;
	friendshipsTo?: { userAId: number }[] | null;
}): number[] {
	return [
		...(user.friendshipsFrom?.map((f) => f.userBId) || []),
		...(user.friendshipsTo?.map((f) => f.userAId) || []),
	];
}

function calculateStats(poem: {
	_count: { poemLikes: number; comments: number };
}) {
	return {
		likesCount: poem._count.poemLikes,
		commentsCount: poem._count.comments,
	};
}

function mapToUsers(dedications: { toUser: any }[]) {
	return dedications.map((d) => ({
		...d.toUser,
		friendIds: getFriendIdsFromRelations(d.toUser),
	}));
}

export function mapPoem<
	T extends { dedications: { toUser: any }[]; _count: any },
>(
	poem: T,
	author?: any,
): T & {
	toUsers: any[];
	stats: { likesCount: number; commentsCount: number };
	author?: any;
} {
	const result: any = {
		...poem,
		toUsers: mapToUsers(poem.dedications),
		stats: calculateStats(poem),
	};

	if (author) {
		result.author = {
			...author,
			friendIds: getFriendIdsFromRelations(author),
		};
	}

	return result;
}
