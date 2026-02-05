import type { AppErrorCode } from '@AppError';
export type { ClientAuthCredentials } from '@GenericSubdomains/authentication/ports/AuthRepository';

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
