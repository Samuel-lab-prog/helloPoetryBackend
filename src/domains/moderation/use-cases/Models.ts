import {
	bannedUserResponseSchema,
	suspendedUserResponseSchema,
} from '../ports/schemas/Index';

export type BannedUserResponse = (typeof bannedUserResponseSchema)['static'];
export type SuspendedUserResponse =
	(typeof suspendedUserResponseSchema)['static'];
