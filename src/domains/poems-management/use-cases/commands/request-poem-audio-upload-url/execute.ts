import { UnprocessableEntityError } from '@GenericSubdomains/utils/domainError';
import type {
	StorageService,
	AudioUploadUrlResult,
} from '@SharedKernel/ports/Storage';
import type { QueriesRepository } from '../../../ports/Queries';
import { canManagePoemAudio } from '../../Policies';
import type { UserMetaData } from '../../../ports/Commands';

export type RequestPoemAudioUploadUrlParams = {
	poemId: number;
	contentType: string;
	meta: UserMetaData;
};

interface Dependencies {
	storageService: StorageService;
	queriesRepository: QueriesRepository;
}

export function requestPoemAudioUploadUrlFactory({
	storageService,
	queriesRepository,
}: Dependencies) {
	return async function requestPoemAudioUploadUrl(
		params: RequestPoemAudioUploadUrlParams,
	): Promise<AudioUploadUrlResult> {
		const { poemId, contentType, meta } = params;

		if (!contentType) {
			throw new UnprocessableEntityError('Content type is required');
		}

		if (!storageService.validateAudioContentType(contentType)) {
			throw new UnprocessableEntityError('Invalid audio content type');
		}

		await canManagePoemAudio({
			ctx: {
				author: {
					id: meta.requesterId,
					status: meta.requesterStatus,
					role: meta.requesterRole,
				},
			},
			poemId,
			queriesRepository,
		});

		return storageService.generatePoemAudioUploadUrl(
			String(poemId),
			contentType,
		);
	};
}
