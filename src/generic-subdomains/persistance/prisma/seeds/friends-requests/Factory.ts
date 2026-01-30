import type { Prisma } from '../../generated/client';

function randomPair(userIds: number[]) {
	const requester = userIds[Math.floor(Math.random() * userIds.length)];
	let addressee = userIds[Math.floor(Math.random() * userIds.length)];

	while (addressee === requester) {
		addressee = userIds[Math.floor(Math.random() * userIds.length)];
	}

	return [requester, addressee];
}

export function generateFriendRequestSeeds(
	userIds: number[],
	quantity: number,
): Prisma.FriendshipRequestCreateInput[] {
	const requests: Prisma.FriendshipRequestCreateInput[] = [];
	const used = new Set<string>();

	while (requests.length < quantity) {
		const [requesterId, addresseeId] = randomPair(userIds);
		const key = `${requesterId}-${addresseeId}`;

		if (used.has(key)) continue;
		used.add(key);

		requests.push({
			requester: { connect: { id: requesterId } },
			addressee: { connect: { id: addresseeId } },
		});
	}

	return requests;
}
