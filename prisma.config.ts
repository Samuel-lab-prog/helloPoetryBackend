import 'dotenv/config';
import { defineConfig } from 'prisma/config';

let url: string;
if (process.env.NODE_ENV === 'test') url = process.env.TEST_DB_URL!;
else if (process.env.NODE_ENV === 'development') url = process.env.DEV_DB_URL!;
else if (process.env.NODE_ENV === 'production') url = process.env.PROD_DB_URL!;
else url = process.env.TEST_DB_URL!;

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
