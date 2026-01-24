import { DomainError } from '@DomainError';

export class UserNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Target user not found.');
	}
}

export class CannotSendRequestToYourselfError extends DomainError {
	public constructor() {
		super('VALIDATION_FAILED', 'You cannot send a friend request to yourself.');
	}
}

export class FriendshipAlreadyExistsError extends DomainError {
	public constructor() {
		super(
			'CONFLICT',
			'A friendship or request already exists between these users.',
		);
	}
}
