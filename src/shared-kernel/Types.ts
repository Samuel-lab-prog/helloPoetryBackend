import type { AppErrorCode } from '@GenericSubdomains/utils/appError';
import type { UserRole, UserStatus } from './Enums';
export type { ClientAuthCredentials } from '@GenericSubdomains/authentication/ports/Models';

export type CommandResult<T> =
	| {
			ok: true;
			data: T;
	  }
	| {
			ok: false;
			data: null;
			error?: Error;
			code: AppErrorCode;
			message?: string;
	  };

export type RequesterContext = {
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};
