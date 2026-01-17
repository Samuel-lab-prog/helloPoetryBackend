import { prisma } from '../../PrismaClient';
import { createUserSeeds } from './Factory';

export async function seedUsers() {
	const usersData = await createUserSeeds();

	await prisma.user.createMany({
		data: usersData,
		skipDuplicates: true,
	});

	const users = await prisma.user.findMany({
		where: {
			nickname: { in: ['normaluser', 'autoruser', 'moderatoruser'] },
		},
		select: { id: true, nickname: true },
	});
	console.log('Users seeded successfully!');
	return users;
}
