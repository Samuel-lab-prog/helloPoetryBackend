import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { PartialUser } from '../read-models/Index';
import { UserNotFoundError, UnauthorizedError } from '../Errors';
import {} from '../dtos/Dtos';
import {} from '../policies/Policies';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export interface GetPublicUserInfoParams {
	userId: number;
}

export function getPublicUserInfoFactory({ queriesRepository }: Dependencies) {
	return async function getPublicUserInfo(
		params: GetPublicUserInfoParams,
	): Promise<PartialUser[] | null> {
		const { userId } = params;

		const result = await queriesRepository.selectPartialUser({
			userId,
		});

		// Implement the use case logic here
		return result;
	};
}
