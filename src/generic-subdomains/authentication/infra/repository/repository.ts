import { usersContractForAuth } from '@SharedKernel/contracts/users/Index';
import type { AuthRepository } from '../../ports/AuthRepository';

// We are importing a repository since authentication module is allowed to read user data
export const AuthPrismaRepository: AuthRepository = {
	findClientByEmail: usersContractForAuth.findClientByEmail,
};
