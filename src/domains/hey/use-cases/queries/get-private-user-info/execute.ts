import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FullUser } from '../read-models/Index';
import { UserNotFoundError, UnauthorizedError } from '../Errors';
import {} from '../dtos/Dtos';
import {} from '../policies/Policies';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export interface GetPrivateUserInfoParams {
	userId: number;
}

export function getPrivateUserInfoFactory({ queriesRepository }: Dependencies) {
	return async function getPrivateUserInfo(
		params: GetPrivateUserInfoParams,
	): Promise<FullUser[] | null> {
		const { userId } = params;

		const result = await queriesRepository.selectFullUser({
			userId,
		});

		// Implement the use case logic here
		return result;
	};
}
