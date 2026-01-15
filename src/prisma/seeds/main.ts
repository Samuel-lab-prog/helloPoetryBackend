import { seedUsers } from './users/Execute';
import { seedPoems } from './poems/Execute';

async function main() {
	console.log('Starting database seeding...');
	try {
		const users = await seedUsers();
		const authorId = users[0]!.id;
		await seedPoems({ authorId });
		console.log('Database seeding completed! ✅');
	} catch (error) {
		console.error('Error during database seeding:', error);
		process.exit(1);
	}
}

main();
