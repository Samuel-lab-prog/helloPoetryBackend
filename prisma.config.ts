import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config();

const env = process.env;
const url =
	env.DATABASE_URL ??
	// Prisma generate doesn't need a real connection, but the config must be valid.
	(env.NODE_ENV === 'production'
		? undefined
		: 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public');

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
