import type { Prisma } from '@PrismaGenerated/browser';
import type { SuspendedUserResponse } from '../../../use-cases/Models';

export const suspensionSelect = {
	id: true,
	userId: true,
	moderatorId: true,
	reason: true,
	startAt: true,
	endAt: true,
} as const satisfies Prisma.UserSanctionSelect;

export type SuspensionRaw = Prisma.UserSanctionGetPayload<{
	select: typeof suspensionSelect;
}>;

export function fromRawToSuspendedUser(
	raw: SuspensionRaw,
): SuspendedUserResponse {
	return {
		id: raw.id,
		reason: raw.reason,
		moderatorId: raw.moderatorId,
		suspendedUserId: raw.userId,
		suspendedAt: raw.startAt,
		endAt: raw.endAt!, // Valid because endAt is required for suspensions
	};
}
