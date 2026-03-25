import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
const DEFAULT_DATABASE_URL =
	'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';

config();

export default defineConfig({
	schema: 'src/generic-subdomains/persistance/prisma/schema.prisma',

	migrations: {
		path: 'src/generic-subdomains/persistance/prisma/migrations',
		seed: 'bun src/generic-subdomains/persistance/prisma/seeds/main.ts',
	},

	datasource: {
		url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
	},
});
