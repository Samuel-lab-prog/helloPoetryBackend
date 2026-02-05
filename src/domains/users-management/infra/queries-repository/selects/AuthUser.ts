import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';
import type { UserAuthCredentials } from '@Domains/users-management/use-cases/queries/Index';

export const authUserSelect = {
	id: true,
	email: true,
	passwordHash: true,
	role: true,
	status: true,
} as const satisfies UserSelect;

export type AuthUserRaw = Prisma.UserGetPayload<{
	select: typeof authUserSelect;
}>;

export function fromRawToAuthUser(raw: AuthUserRaw): UserAuthCredentials {
	return {
		id: raw.id,
		email: raw.email,
		passwordHash: raw.passwordHash,
		role: raw.role,
		status: raw.status,
	};
}
