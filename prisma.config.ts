import 'dotenv/config';
import { defineConfig } from 'prisma/config';

let url: string;
if (process.env.NODE_ENV !== 'prod') {
	url = process.env.TEST_DB_URL!;
} else {
	url = process.env.PROD_DB_URL!;
}

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
