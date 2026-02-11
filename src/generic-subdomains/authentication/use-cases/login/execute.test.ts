import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { loginClientFactory } from './execute';
import { InvalidCredentialsError } from '../Errors';

describe('USE-CASE - Authentication', () => {
	let tokenService: any;
	let hashService: any;
	let findClientByEmail: any;
	let loginClient: any;

	beforeEach(() => {
		tokenService = {
			generateToken: mock(),
		};

		hashService = {
			compare: mock(),
		};

		findClientByEmail = mock();

		loginClient = loginClientFactory({
			tokenService,
			hashService,
			findClientByEmail,
		});
	});
	describe('Login Client', () => {
		it('Should throw InvalidCredentialsError if client email does not exist', async () => {
			findClientByEmail.mockResolvedValue(null);

			await expect(
				loginClient('user@example.com', 'password'),
			).rejects.toBeInstanceOf(InvalidCredentialsError);

			expect(findClientByEmail).toHaveBeenCalledWith('user@example.com');
		});

		it('Should throw InvalidCredentialsError if password is invalid', async () => {
			const client = {
				id: 1,
				email: 'user@example.com',
				role: 'admin',
				status: 'active',
				passwordHash: 'hashed-password',
			};

			findClientByEmail.mockResolvedValue(client);
			hashService.compare.mockResolvedValue(false);

			await expect(
				loginClient('user@example.com', 'wrong-password'),
			).rejects.toBeInstanceOf(InvalidCredentialsError);

			expect(findClientByEmail).toHaveBeenCalledWith('user@example.com');
			expect(hashService.compare).toHaveBeenCalledWith(
				'wrong-password',
				client.passwordHash,
			);
		});

		it('Should return token and client info when credentials are valid', async () => {
			const client = {
				id: 1,
				email: 'user@example.com',
				role: 'admin',
				status: 'active',
				passwordHash: 'hashed-password',
			};

			findClientByEmail.mockResolvedValue(client);
			hashService.compare.mockResolvedValue(true);
			tokenService.generateToken.mockReturnValue('jwt-token');

			const result = await loginClient('user@example.com', 'correct-password');

			expect(result).toEqual({
				token: 'jwt-token',
				client: {
					id: client.id,
					role: client.role,
					status: client.status,
				},
			});

			expect(findClientByEmail).toHaveBeenCalledWith('user@example.com');
			expect(hashService.compare).toHaveBeenCalledWith(
				'correct-password',
				client.passwordHash,
			);
			expect(tokenService.generateToken).toHaveBeenCalledWith(
				{ clientId: client.id, role: client.role, email: client.email },
				3600,
			);
		});
	});
});
