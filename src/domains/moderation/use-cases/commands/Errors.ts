import { DomainError } from '@DomainError';

export class UserNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'User not found.');
	}
}

export class UserAlreadyBannedError extends DomainError {
	public constructor() {
		super('CONFLICT', 'User is already banned.');
	}
}

export class CannotBanSelfError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'A moderator cannot ban themselves.');
	}
}

export class InsufficientPermissionsError extends DomainError {
	public constructor() {
		super(
			'FORBIDDEN_USER_OPERATION',
			'You do not have permission to ban users.',
		);
	}
}

export class UserAlreadySuspendedError extends DomainError {
	public constructor() {
		super('CONFLICT', 'User is already suspended.');
	}
}

export class CannotSuspendSelfError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'A moderator cannot suspend themselves.');
	}
}
