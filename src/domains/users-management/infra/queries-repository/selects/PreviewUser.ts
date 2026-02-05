import type { UsersPage } from '../../../use-cases/Models';
import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/internal/prismaNamespaceBrowser';
export const previewUserSelect = {
	id: true,
	nickname: true,
	avatarUrl: true,
	role: true,
} as const satisfies UserSelect;

export type PreviewUserRaw = Prisma.UserGetPayload<{
	select: typeof previewUserSelect;
}>;

export function fromRawToPreviewUser(
	raw: PreviewUserRaw,
): UsersPage['users'][number] {
	return {
		id: raw.id,
		nickname: raw.nickname,
		avatarUrl: raw.avatarUrl,
		role: raw.role,
	};
}
