import type { AppErrorCode } from '@AppError';

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
