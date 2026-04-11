import {
	bannedUserResponseSchema,
	ModeratePoemBodySchema,
	ModeratePoemResultSchema,
	suspendedUserResponseSchema,
} from '../ports/schemas/Index';
import type { PoemModerationStatus } from '@SharedKernel/Enums';

export type BannedUserResponse = (typeof bannedUserResponseSchema)['static'];
export type SuspendedUserResponse =
	(typeof suspendedUserResponseSchema)['static'];
export type ModeratePoemBody = (typeof ModeratePoemBodySchema)['static'];
export type ModeratePoemResult = (typeof ModeratePoemResultSchema)['static'];

export type PoemModerationRead = {
	id: number;
	title: string;
	moderationStatus: PoemModerationStatus;
	author: {
		id: number;
		nickname: string;
		avatarUrl: string | null;
	};
};

export type PoemNotificationsData = {
	id: number;
	title: string;
	authorId: number;
	authorNickname: string;
	authorAvatarUrl: string | null;
	dedicatedUserIds: number[];
	mentionedUserIds: number[];
};
