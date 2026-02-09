import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const url = process.env.DATABASE_URL;

if (!url) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: 'src/generic-subdomains/persistance/prisma/schema.prisma',

	migrations: {
		path: 'src/generic-subdomains/persistance/prisma/migrations',
		seed: 'bun src/generic-subdomains/persistance/prisma/seeds/main.ts',
	},

	datasource: {
		url,
	},
});
