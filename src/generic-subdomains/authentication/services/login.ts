import { BcryptHashService } from '../infra/hashing/BcryptHashService';
import { JwtTokenService } from '../infra/token/JwtTokenService';
import { AuthPrismaRepository } from '../infra/repository/repository';
import { makeLoginClient } from '../use-cases/login/login';

export const login = makeLoginClient({
	hashService: BcryptHashService,
	tokenService: JwtTokenService,
	findClientByEmail: AuthPrismaRepository['findClientByEmail'],
});
