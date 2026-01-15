import { prisma } from '../../myClient';
import { createUserSeeds } from './Factory';

export async function seedUsers() {
	const usersData = await createUserSeeds();

	const users = await prisma.user.createManyAndReturn({
		data: usersData,
		skipDuplicates: true,
		select: { id: true, nickname: true },
	});

	console.log('Users seeded successfully!');

	return users;
}
