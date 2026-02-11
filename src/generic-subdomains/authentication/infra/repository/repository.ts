import { usersContractForAuth } from '@SharedKernel/contracts/users/Index';
import type { AuthRepository } from '../../ports/AuthRepository';

export const authRepository: AuthRepository = {
	findClientByEmail: usersContractForAuth.findClientByEmail,
};
