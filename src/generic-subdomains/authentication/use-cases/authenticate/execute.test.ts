import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { authenticateClientFactory } from './execute';
import { InvalidTokenError, ClientNotFoundError } from '../Errors';

describe('USE-CASE - Authentication', () => {
	let tokenService: any;
	let findClientByEmail: any;
	let authenticateClient: any;

	beforeEach(() => {
		tokenService = {
			verifyToken: mock(),
		};

		findClientByEmail = mock();

		authenticateClient = authenticateClientFactory({
			tokenService,
			findClientByEmail,
		});
	});

	describe('Authenticate Client', () => {
		it('Should throw InvalidTokenError if token is invalid', async () => {
			tokenService.verifyToken.mockReturnValue(null);

			await expect(authenticateClient('some-token')).rejects.toBeInstanceOf(
				InvalidTokenError,
			);

			expect(tokenService.verifyToken).toHaveBeenCalledWith('some-token');
		});

		it('Should throw InvalidTokenError if token payload does not contain email', async () => {
			tokenService.verifyToken.mockReturnValue({});

			await expect(authenticateClient('some-token')).rejects.toBeInstanceOf(
				InvalidTokenError,
			);

			expect(tokenService.verifyToken).toHaveBeenCalledWith('some-token');
		});

		it('Should throw ClientNotFoundError if no client exists with the token email', async () => {
			tokenService.verifyToken.mockReturnValue({ email: 'user@example.com' });
			findClientByEmail.mockResolvedValue(null);

			await expect(authenticateClient('valid-token')).rejects.toBeInstanceOf(
				ClientNotFoundError,
			);

			expect(tokenService.verifyToken).toHaveBeenCalledWith('valid-token');
			expect(findClientByEmail).toHaveBeenCalledWith('user@example.com');
		});

		it('Should return client info when token and client are valid', async () => {
			const client = { id: 1, role: 'admin', status: 'active' };
			tokenService.verifyToken.mockReturnValue({ email: 'user@example.com' });
			findClientByEmail.mockResolvedValue(client);

			const result = await authenticateClient('valid-token');

			expect(result).toEqual({
				id: client.id,
				role: client.role,
				status: client.status,
			});

			expect(tokenService.verifyToken).toHaveBeenCalledWith('valid-token');
			expect(findClientByEmail).toHaveBeenCalledWith('user@example.com');
		});
	});
});
