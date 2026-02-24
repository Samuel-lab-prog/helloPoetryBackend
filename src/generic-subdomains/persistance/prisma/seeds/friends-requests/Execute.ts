import { prisma } from '../../prismaClient';
import { generateFriendRequestSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedFriendRequests(userIds: number[], quantity: number) {
	const requests = generateFriendRequestSeeds(userIds, quantity);

	await Promise.all(
		requests.map((request) =>
			prisma.friendshipRequest.create({
				data: request,
			}),
		),
	);

	console.log(green('✅ Friendship requests seeded successfully!'));
}
