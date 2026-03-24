import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { getDatabaseUrl } from 'config';

config();

export default defineConfig({
	schema: 'src/generic-subdomains/persistance/prisma/schema.prisma',

	migrations: {
		path: 'src/generic-subdomains/persistance/prisma/migrations',
		seed: 'bun src/generic-subdomains/persistance/prisma/seeds/main.ts',
	},

	datasource: {
		url: getDatabaseUrl(),
	},
});
