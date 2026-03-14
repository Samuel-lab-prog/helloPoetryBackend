import { UnprocessableEntityError } from '@GenericSubdomains/utils/domainError';
import type { StorageService, AvatarUploadUrlResult } from '@SharedKernel/ports/Storage';

export type RequestAvatarUploadUrlParams = {
	requesterId: number;
	contentType: string;
};

interface Dependencies {
	storageService: StorageService;
}

export function requestAvatarUploadUrlFactory({ storageService }: Dependencies) {
	return async function requestAvatarUploadUrl(
		params: RequestAvatarUploadUrlParams,
	): Promise<AvatarUploadUrlResult> {
		const { requesterId, contentType } = params;

		if (!contentType) {
			throw new UnprocessableEntityError('Content type is required');
		}

		if (!storageService.validateImageContentType(contentType)) {
			throw new UnprocessableEntityError('Invalid image content type');
		}

		return storageService.generateAvatarUploadUrl(String(requesterId), contentType);
	};
}
