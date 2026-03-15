import { canManagePoemAudio } from '../../Policies';
import type { CommandsRepository, UserMetaData } from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';

export type UpdatePoemAudioParams = {
	poemId: number;
	audioUrl: string | null;
	meta: UserMetaData;
};

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function updatePoemAudioFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function updatePoemAudio(params: UpdatePoemAudioParams) {
		const { poemId, audioUrl, meta } = params;

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

		await commandsRepository.updatePoemAudio({
			poemId,
			audioUrl,
		});

		return { audioUrl };
	};
}
