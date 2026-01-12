import { describe, it, expect, vi, beforeEach } from 'bun:test';

import { makeLoginClient } from './login';
import { InvalidCredentialsError } from '../errors';

import type { TokenService } from '../../ports/TokenService';
import type { HashService } from '../../ports/HashService';
import type { ClientAuthCredentials } from '../../ports/AuthRepository';

describe('makeLoginClient', () => {
	let tokenService: TokenService;
	let hashService: HashService;
	let findClientByEmail: ReturnType<typeof vi.fn>;

	const fakeClient: ClientAuthCredentials = {
		id: 1,
		role: 'user',
		email: 'test@email.com',
		passwordHash: 'hashed-password',
	};

	beforeEach(() => {
		tokenService = {
			generateToken: vi.fn().mockReturnValue('fake-jwt-token'),
			verifyToken: vi.fn(),
		};

		hashService = {
			hash: vi.fn(),
			compare: vi.fn().mockResolvedValue(true),
		};

		findClientByEmail = vi.fn().mockResolvedValue(fakeClient);
	});

	it('should login successfully and return token and client data', async () => {
		const loginClient = makeLoginClient({
			tokenService,
			hashService,
			findClientByEmail,
		});

		const result = await loginClient('test@email.com', 'plain-password');

		expect(findClientByEmail).toHaveBeenCalledWith('test@email.com');
		expect(hashService.compare).toHaveBeenCalledWith(
			'plain-password',
			'hashed-password',
		);

		expect(tokenService.generateToken).toHaveBeenCalledWith(
			{
				clientId: 1,
				role: 'user',
				email: 'test@email.com',
			},
			60 * 60 * 1000,
		);

		expect(result).toEqual({
			token: 'fake-jwt-token',
			client: {
				id: 1,
				role: 'user',
			},
		});
	});

	it('should throw InvalidCredentialsError if client does not exist', async () => {
		findClientByEmail.mockResolvedValueOnce(null);

		const loginClient = makeLoginClient({
			tokenService,
			hashService,
			findClientByEmail,
		});

		await expect(
			loginClient('invalid@email.com', 'password'),
		).rejects.toBeInstanceOf(InvalidCredentialsError);

		expect(hashService.compare).not.toHaveBeenCalled();
		expect(tokenService.generateToken).not.toHaveBeenCalled();
	});

	it('should throw InvalidCredentialsError if password is invalid', async () => {
		hashService.compare = vi.fn().mockResolvedValue(false);

		const loginClient = makeLoginClient({
			tokenService,
			hashService,
			findClientByEmail,
		});

		await expect(
			loginClient('test@email.com', 'wrong-password'),
		).rejects.toBeInstanceOf(InvalidCredentialsError);

		expect(tokenService.generateToken).not.toHaveBeenCalled();
	});
});
