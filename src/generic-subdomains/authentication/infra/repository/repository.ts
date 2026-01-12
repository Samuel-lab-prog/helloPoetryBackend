import { AuthReadRepository } from '@domains/users-management/infra/repository/repository';
import type { AuthRepository } from '../../ports/AuthRepository';

// We are importing a repository since authentication module is allowed to read user data
export const AuthPrismaRepository: AuthRepository = {
	findClientByEmail: AuthReadRepository['selectAuthUserByEmail'],
};
