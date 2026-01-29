/* eslint-disable max-classes-per-file */
import { DomainError } from '@DomainError';

export class PoemNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Poem not found.');
	}
}

export class AlreadyLikedError extends DomainError {
	public constructor() {
		super('CONFLICT', 'User already liked this poem.');
	}
}

export class LikeNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Like not found.');
	}
}

export class EmptyCommentError extends DomainError {
	public constructor() {
		super('BAD_REQUEST', 'Comment cannot be empty.');
	}
}

export class CommentNotFoundError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Comment not found.');
	}
}

export class NotCommentOwnerError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'User is not comment owner.');
	}
}

export class ForbiddenError extends DomainError {
	public constructor() {
		super(
			'FORBIDDEN_USER_OPERATION',
			'User is not allowed to perform this action.',
		);
	}
}

export class PrivatePoemError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'Poem is private.');
	}
}

export class FriendsOnlyPoemError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'Poem is restricted to friends.');
	}
}

export class UserBlockedError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'Interaction between users is blocked.');
	}
}

export class DeletedCommentError extends DomainError {
	public constructor() {
		super('CONFLICT', 'Comment is deleted.');
	}
}

export class DeletedPoemError extends DomainError {
	public constructor() {
		super('NOT_FOUND', 'Poem not found.');
	}
}

export class CommentsDisabledError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'Comments are disabled for this poem.');
	}
}

export class CannotLikeOwnCommentError extends DomainError {
	public constructor() {
		super('FORBIDDEN_USER_OPERATION', 'User cannot like own comment.');
	}
}
