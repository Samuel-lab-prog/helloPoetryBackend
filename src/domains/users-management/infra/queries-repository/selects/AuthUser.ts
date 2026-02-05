import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';
import type { AuthUser } from '@Domains/users-management/use-cases/Models';

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

export function fromRawToAuthUser(raw: AuthUserRaw): AuthUser {
	return {
		id: raw.id,
		email: raw.email,
		passwordHash: raw.passwordHash,
		role: raw.role,
		status: raw.status,
	};
}
