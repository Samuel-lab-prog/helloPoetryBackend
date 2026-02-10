import { defineConfig } from 'prisma/config';

const env = process.env;
const url = env.DATABASE_URL;

if (!url) throw new Error('DATABASE_URL is not set in .env');

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
