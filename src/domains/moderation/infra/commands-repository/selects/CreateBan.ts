import type { Prisma } from '@PrismaGenerated/browser';

export const banSelect = {
	id: true,
	userId: true,
	moderatorId: true,
	reason: true,
	startAt: true,
	endAt: true,
} as const satisfies Prisma.UserSanctionSelect;

import type { BannedUserResponse } from '../../../use-cases/Models';

export type BanRaw = Prisma.UserSanctionGetPayload<{
	select: typeof banSelect;
}>;

export function fromRawToBannedUser(raw: BanRaw): BannedUserResponse {
	return {
		id: raw.id,
		reason: raw.reason,
		moderatorId: raw.moderatorId,
		bannedUserId: raw.userId,
		bannedAt: raw.startAt,
	};
}
