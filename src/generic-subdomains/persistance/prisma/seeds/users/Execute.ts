import { prisma } from '../../PrismaClient';
import { createUserSeeds } from './Factory';
import { green } from 'kleur/colors';

export async function seedUsers() {
	const usersData = await createUserSeeds();

	await prisma.user.createMany({
		data: usersData,
		skipDuplicates: true,
	});

	const users = await prisma.user.findMany({
		where: {
			nickname: { in: ['normaluser', 'authoruser', 'moderatoruser'] },
		},
		select: { id: true, nickname: true },
	});
	console.log(green('✅ Users seeded successfully!'));
	return users;
}
