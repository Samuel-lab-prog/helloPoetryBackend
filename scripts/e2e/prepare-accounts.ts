import bcrypt from 'bcryptjs';
import { prisma } from '@Prisma/PrismaClient';
import {
	assertDatabaseSafety,
	parseDatabaseIdentity,
} from '../../src/server-config/utils/databaseSafety';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
	throw new Error('DATABASE_URL is required for E2E account preparation.');
assertDatabaseSafety({ databaseUrl, nodeEnv: process.env.NODE_ENV });

if (
	!/^hello-poetry-e2e-\d+-[a-f0-9]{12}$/.test(
		process.env.HELLO_POETRY_E2E_PROJECT ?? '',
	)
) {
	throw new Error(
		'Run this fixture only through the integrated E2E orchestrator.',
	);
}

const identity = parseDatabaseIdentity(databaseUrl);
if (
	!identity ||
	!['127.0.0.1', 'localhost'].includes(identity.host.toLowerCase()) ||
	identity.port !== '55432' ||
	identity.database !== 'hello_poetry_e2e_test' ||
	identity.schema !== 'public'
) {
	throw new Error(
		'Integrated E2E account preparation only accepts 127.0.0.1:55432/hello_poetry_e2e_test?schema=public.',
	);
}

const password = 'HelloPoetry-E2E-Only-2026';
const passwordHash = await bcrypt.hash(password, 4);
const accounts = [
	{
		email: 'e2e-author@hello-poetry.test',
		name: 'E2E Author',
		nickname: 'e2e_author',
		role: 'author' as const,
	},
	{
		email: 'e2e-reader@hello-poetry.test',
		name: 'E2E Reader',
		nickname: 'e2e_reader',
		role: 'author' as const,
	},
	{
		email: 'e2e-moderator@hello-poetry.test',
		name: 'E2E Moderator',
		nickname: 'e2e_moderator',
		role: 'moderator' as const,
	},
] as const;

try {
	for (const account of accounts) {
		await prisma.user.upsert({
			where: { email: account.email },
			create: {
				...account,
				passwordHash,
				bio: 'Disposable account for integrated E2E tests.',
				status: 'active',
			},
			update: {
				...account,
				passwordHash,
				bio: 'Disposable account for integrated E2E tests.',
				status: 'active',
				deletedAt: null,
			},
		});
	}

	console.log(
		`Prepared ${accounts.length} disposable integrated E2E accounts.`,
	);
} finally {
	await prisma.$disconnect();
}
