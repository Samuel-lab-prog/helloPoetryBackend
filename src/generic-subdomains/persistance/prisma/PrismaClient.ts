import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

let url: string;
if (process.env.NODE_ENV === 'prod') {
	url = `${process.env.PROD_DB_URL}`;
} else if (process.env.NODE_ENV === 'dev') {
	url = `${process.env.DEV_DB_URL}`;
} else if (process.env.NODE_ENV === 'test') {
	url = `${process.env.TEST_DB_URL}`;
} else {
	throw new Error('NODE_ENV is not set to a valid value');
}
const connectionString = url;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter, errorFormat: 'pretty' });
