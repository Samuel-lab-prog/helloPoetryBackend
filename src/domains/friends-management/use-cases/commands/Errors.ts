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

export class RequestAlreadySentError extends DomainError {
	public constructor() {
		super('CONFLICT', 'A friend request has already been sent to this user.');
	}
}

export class FriendRequestBlockedError extends DomainError {
	public constructor() {
		super(
			'FORBIDDEN_USER_OPERATION',
			'Cannot send a friend request due to a blocking relationship.',
		);
	}
}

export class RequestNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Friend request not found.');
	}
}

export class FriendshipNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Friendship not found.');
	}
}

export class BlockedRelationshipNotFoundError extends DomainError {
	public constructor() {
		super(
			'NOT_FOUND',
			'Cannot perform this operation due to a blocking relationship.',
		);
	}
}
