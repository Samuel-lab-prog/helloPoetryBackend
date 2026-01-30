import { seedUsers } from './users/Execute';
import { seedPoems } from './poems/Execute';
import { green } from 'kleur/colors';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';
import { prisma } from '../PrismaClient';

async function main() {
	console.log('Starting database seeding...');

	try {
		await clearDatabase();

		const USERS_AMOUNT = 20;
		const POEMS_AMOUNT = 100;

		await seedUsers(USERS_AMOUNT);

		const users = await prisma.user.findMany({
			select: { id: true },
		});

		const userIds = users.map((u) => u.id);

		await seedPoems(userIds, POEMS_AMOUNT);

		console.log(green('✅ Database seeding completed!'));
	} catch (error) {
		console.error('Error during database seeding:', error);
		process.exit(1);
	}
}

main();
