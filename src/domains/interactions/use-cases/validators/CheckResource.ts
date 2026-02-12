import {
	NotFoundError,
	UnprocessableEntityError,
	ForbiddenError,
} from '@DomainError';

type ResourceType =
	| string
	| number
	| null
	| undefined
	| unknown
	| boolean
	| object;

export function ensureResource(
	resource: ResourceType,
	message = 'Resource not found',
) {
	const str = typeof resource === 'string' ? resource.trim() : resource;

	return {
		value() {
			return resource;
		},
		notNull() {
			if (resource === null) throw new NotFoundError(message);
			return this;
		},
		notUndefined() {
			if (resource === undefined) throw new NotFoundError(message);
			return this;
		},
		minLength(min: number) {
			if (typeof str !== 'string')
				throw new UnprocessableEntityError('Resource must be a string');
			if (str.length < min)
				throw new UnprocessableEntityError(
					`Content must be at least ${min} characters long`,
				);
			return this;
		},
		maxLength(max: number) {
			if (typeof str !== 'string')
				throw new UnprocessableEntityError('Resource must be a string');
			if (str.length > max)
				throw new UnprocessableEntityError(
					`Content cannot exceed ${max} characters`,
				);
			return this;
		},
		bannedWords(bannedWords: string[]) {
			if (typeof str !== 'string') return this;
			const foundBannedWords = bannedWords.filter((word) => str.includes(word));
			if (foundBannedWords.length > 0) {
				throw new UnprocessableEntityError(
					`Content cannot include the following words: ${foundBannedWords.join(
						', ',
					)}`,
				);
			}
			return this;
		},
		minValue(min: number) {
			if (typeof resource !== 'number')
				throw new UnprocessableEntityError('Resource must be a number');
			if (resource < min)
				throw new UnprocessableEntityError(`Value must be at least ${min}`);
			return this;
		},
		maxValue(max: number) {
			if (typeof resource !== 'number')
				throw new UnprocessableEntityError('Resource must be a number');
			if (resource > max)
				throw new UnprocessableEntityError(`Value cannot exceed ${max}`);
			return this;
		},
		isTrue() {
			if (resource !== true)
				throw new ForbiddenError('Expected resource to be true');
			return this;
		},
		isFalse() {
			if (resource !== false)
				throw new ForbiddenError('Expected resource to be false');
			return this;
		},
	};
}
