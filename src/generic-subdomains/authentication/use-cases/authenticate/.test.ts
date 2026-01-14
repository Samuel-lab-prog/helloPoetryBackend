import { describe, it, expect, vi, beforeEach } from 'bun:test';

import { authenticateClientFactory } from './authenticate';
import { ClientNotFoundError, InvalidTokenError } from '../errors';

import type { TokenService } from '../../ports/TokenService';

describe('authenticateClientFactory', () => {
	let tokenService: TokenService;
	let findClientByEmail: ReturnType<typeof vi.fn>;

	const fakeClient = {
		id: 1,
		role: 'user',
		email: 'test@email.com',
	};

	beforeEach(() => {
		tokenService = {
			generateToken: vi.fn(),
			verifyToken: vi.fn(),
		};

		findClientByEmail = vi.fn();
	});

	it('should authenticate client successfully with valid token', async () => {
		tokenService.verifyToken = vi.fn().mockReturnValue({
			email: 'test@email.com',
		});

		findClientByEmail.mockResolvedValue(fakeClient);

		const authenticateClient = authenticateClientFactory({
			tokenService,
			findClientByEmail,
		});

		const result = await authenticateClient('valid-token');

		expect(tokenService.verifyToken).toHaveBeenCalledWith('valid-token');
		expect(findClientByEmail).toHaveBeenCalledWith('test@email.com');

		expect(result).toEqual({
			id: 1,
			role: 'user',
		});
	});

	it('should throw InvalidTokenError when token payload is null', async () => {
		tokenService.verifyToken = vi.fn().mockReturnValue(null);

		const authenticateClient = authenticateClientFactory({
			tokenService,
			findClientByEmail,
		});

		await expect(authenticateClient('invalid-token')).rejects.toBeInstanceOf(
			InvalidTokenError,
		);

		expect(findClientByEmail).not.toHaveBeenCalled();
	});

	it('should throw InvalidTokenError when token payload has no email', async () => {
		tokenService.verifyToken = vi.fn().mockReturnValue({});

		const authenticateClient = authenticateClientFactory({
			tokenService,
			findClientByEmail,
		});

		await expect(authenticateClient('invalid-token')).rejects.toBeInstanceOf(
			InvalidTokenError,
		);

		expect(findClientByEmail).not.toHaveBeenCalled();
	});

	it('should throw InvalidTokenError when verifyToken throws', async () => {
		tokenService.verifyToken = vi.fn().mockImplementation(() => {
			throw new Error('jwt malformed');
		});

		const authenticateClient = authenticateClientFactory({
			tokenService,
			findClientByEmail,
		});

		await expect(authenticateClient('broken-token')).rejects.toBeInstanceOf(
			InvalidTokenError,
		);

		expect(findClientByEmail).not.toHaveBeenCalled();
	});

	it('should throw InvalidTokenError when client is not found', async () => {
		tokenService.verifyToken = vi.fn().mockReturnValue({
			email: 'missing@email.com',
		});

		findClientByEmail.mockResolvedValue(null);

		const authenticateClient = authenticateClientFactory({
			tokenService,
			findClientByEmail,
		});

		await expect(authenticateClient('valid-token')).rejects.toBeInstanceOf(
			InvalidTokenError,
		);

		expect(findClientByEmail).toHaveBeenCalledWith('missing@email.com');
	});

	it('should not leak ClientNotFoundError (always normalize to InvalidTokenError)', async () => {
		tokenService.verifyToken = vi.fn().mockReturnValue({
			email: 'test@email.com',
		});

		findClientByEmail.mockImplementation(() => {
			throw new ClientNotFoundError();
		});

		const authenticateClient = authenticateClientFactory({
			tokenService,
			findClientByEmail,
		});

		await expect(authenticateClient('valid-token')).rejects.toBeInstanceOf(
			InvalidTokenError,
		);
	});
});
