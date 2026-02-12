import { UnprocessableEntityError } from '@DomainError';

export function checkContent(content: string) {
	return {
		minLength(min: number) {
			if (content.length < min)
				throw new UnprocessableEntityError(
					`Content must be at least ${min} characters long`,
				);
			return this;
		},
		maxLength(max: number) {
			if (content.length > max)
				throw new UnprocessableEntityError(
					`Content cannot exceed ${max} characters`,
				);
			return this;
		},
		bannedWords(bannedWords: string[]) {
			const foundBannedWords = bannedWords.filter((word) =>
				content.includes(word),
			);
			if (foundBannedWords.length > 0) {
				throw new UnprocessableEntityError(
					`Content cannot include the following words: ${foundBannedWords.join(
						', ',
					)}`,
				);
			}
			return this;
		},
	};
}
