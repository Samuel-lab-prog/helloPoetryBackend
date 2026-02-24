import { prisma } from '../../PrismaClient';
import { createUserSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedUsers(quantity: number) {
	const users = await createUserSeeds(quantity);

	await Promise.all(
		users.map((user) =>
			prisma.user.create({
				data: user,
			}),
		),
	);

	console.log(green('✅ Users seeded successfully!'));
}
