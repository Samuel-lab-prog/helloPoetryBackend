import type { QueriesRepository } from '../../../ports/Queries';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function checkNicknameAvailabilityFactory({
	queriesRepository,
}: Dependencies) {
	return function checkNicknameAvailability(
		nickname: string,
	): Promise<boolean> {
		return queriesRepository.findNickname(nickname);
	};
}
