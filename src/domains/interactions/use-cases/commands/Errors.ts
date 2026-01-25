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
