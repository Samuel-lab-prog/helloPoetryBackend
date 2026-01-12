import { seedUsers } from './users';

async function main() {
	console.log('Starting database seeding...');
	try {
		await seedUsers();
		console.log('Database seeding completed! ✅');
	} catch (error) {
		console.error('Error during database seeding:', error);
		process.exit(1);
	}
}

main();
