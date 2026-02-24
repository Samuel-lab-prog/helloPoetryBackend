import { prisma } from '../../prismaClient';
import { generateFriendshipSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedFriends(userIds: number[], quantity: number) {
	const friendships = generateFriendshipSeeds(userIds, quantity);

	await Promise.all(
		friendships.map((friendship) =>
			prisma.friendship.create({
				data: friendship,
			}),
		),
	);

	console.log(green('✅ Friendships seeded successfully!'));
}
