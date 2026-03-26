import { prisma } from '../src/generic-subdomains/persistance/prisma/PrismaClient';
import { BcryptHashService } from '../src/shared-kernel/infra/Bcrypt';

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is required`);
	return value;
}

function optionalEnv(name: string): string | undefined {
	const value = process.env[name];
	return value && value.trim().length > 0 ? value : undefined;
}

async function main() {
	const email = requireEnv('ADMIN_EMAIL');
	const password = requireEnv('ADMIN_PASSWORD');

	const name = optionalEnv('ADMIN_NAME') ?? 'Admin';
	const nickname = optionalEnv('ADMIN_NICKNAME') ?? 'admin';
	const bio = optionalEnv('ADMIN_BIO') ?? 'Admin account';
	const avatarUrl = optionalEnv('ADMIN_AVATAR_URL');

	const passwordHash = await BcryptHashService.hash(password);

	const existingByEmail = await prisma.user.findUnique({
		where: { email },
	});

	if (existingByEmail) {
		await prisma.user.update({
			where: { email },
			data: {
				role: 'admin',
				passwordHash,
				name: optionalEnv('ADMIN_NAME') ?? existingByEmail.name,
				nickname: optionalEnv('ADMIN_NICKNAME') ?? existingByEmail.nickname,
				bio: optionalEnv('ADMIN_BIO') ?? existingByEmail.bio,
				...(avatarUrl !== undefined ? { avatarUrl } : {}),
			},
		});

		console.log(
			`Admin user updated for email ${email}. Role set to admin.`,
		);
		return;
	}

	const existingByNickname = await prisma.user.findUnique({
		where: { nickname },
	});

	if (existingByNickname) {
		throw new Error(
			`Nickname "${nickname}" is already in use. Set ADMIN_NICKNAME to a unique value.`,
		);
	}

	await prisma.user.create({
		data: {
			email,
			passwordHash,
			name,
			nickname,
			bio,
			avatarUrl: avatarUrl ?? null,
			role: 'admin',
		},
	});

	console.log(`Admin user created for email ${email}.`);
}

main()
	.catch((error) => {
		console.error('Failed to create admin user:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
