import type { UserStatus } from "../../queries/Index";
import { CrossUserUpdateError, UserNotActiveError } from "../Errors";

type CanUpdatePolicyInput = {
	requesterId: number;
	requesterStatus: UserStatus;
	targetId: number;
};

export function canUpdateData(c: CanUpdatePolicyInput): void {
	const isResourceOwner = c.requesterId === c.targetId;
	const isActve = c.requesterStatus === 'active';

	if (!isResourceOwner) throw new CrossUserUpdateError();
	if (!isActve) throw new UserNotActiveError();
}
