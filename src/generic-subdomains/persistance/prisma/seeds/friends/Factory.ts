import type { Prisma } from '../../generated/client';

function randomPair(userIds: number[]) {
	const a = userIds[Math.floor(Math.random() * userIds.length)];
	let b = userIds[Math.floor(Math.random() * userIds.length)];

	while (b === a) {
		b = userIds[Math.floor(Math.random() * userIds.length)];
	}

	return a! < b! ? [a, b] : [b, a];
}

export function generateFriendshipSeeds(
	userIds: number[],
	quantity: number,
): Prisma.FriendshipCreateInput[] {
	const friendships: Prisma.FriendshipCreateInput[] = [];
	const used = new Set<string>();

	while (friendships.length < quantity) {
		const [userAId, userBId] = randomPair(userIds);
		const key = `${userAId}-${userBId}`;

		if (used.has(key)) continue;
		used.add(key);

		friendships.push({
			userA: { connect: { id: userAId } },
			userB: { connect: { id: userBId } },
		});
	}

	return friendships;
}
