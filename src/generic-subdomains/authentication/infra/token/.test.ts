import { JwtTokenService } from './JwtTokenService';
import type { TokenPayload } from '../../ports/TokenService';

import { it, expect, describe, beforeAll } from 'bun:test';

let token: string;
const payload: TokenPayload = {
	clientId: 1,
	role: 'admin',
	email: 'admin@example.com',
};
const expiresIn = 3600 * 1000;

describe('JwtTokenService', () => {
	beforeAll(() => {
		token = JwtTokenService.generateToken(payload, expiresIn);
	});

	it('Should generate a valid JWT token', () => {
		expect(token).toBeDefined();
		expect(typeof token).toBe('string');
		expect(token.split('.').length).toBe(3);
	});

	it('Should verify and decode the JWT token correctly', () => {
		const decoded = JwtTokenService.verifyToken(token);
		expect(decoded).not.toBeNull();
		expect(decoded!.clientId).toBe(payload.clientId);
		expect(decoded!.role).toBe(payload.role);
		expect(decoded!.email).toBe(payload.email);
	});

	it('Should return null for an invalid JWT token', () => {
		const decoded = JwtTokenService.verifyToken('invalid.token.here');
		expect(decoded).toBeNull();
	});
});
