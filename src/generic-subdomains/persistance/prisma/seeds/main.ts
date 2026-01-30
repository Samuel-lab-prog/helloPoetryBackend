import { seedUsers } from './users/Execute';
import { green } from 'kleur/colors';
import { clearDatabase } from '@GenericSubdomains/utils/ClearDatabase';

async function main() {
	console.log('Starting database seeding...');
	try {
		await clearDatabase();

		await seedUsers();
		// You can add more seed functions here as needed
		console.log(green('✅ Database seeding completed!'));
	} catch (error) {
		console.error('Error during database seeding:', error);
		process.exit(1);
	}
}

main();
