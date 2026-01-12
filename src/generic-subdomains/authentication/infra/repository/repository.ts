import { QueriesRepository } from '@root/domains/users-management/infra/read-repository/repository';
import type { AuthRepository } from '../../ports/AuthRepository';

// We are importing a repository since authentication module is allowed to read user data
export const AuthPrismaRepository: AuthRepository = {
	findClientByEmail: QueriesRepository['selectAuthUserByEmail'],
};
