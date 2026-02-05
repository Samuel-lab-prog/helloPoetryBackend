import { queriesRepository } from '@Domains/users-management/infra/queries-repository/Repository';
import type { AuthRepository } from '../../ports/AuthRepository';

// We are importing a repository since authentication module is allowed to read user data
export const AuthPrismaRepository: AuthRepository = {
	findClientByEmail: queriesRepository['selectAuthUserByEmail'],
};
