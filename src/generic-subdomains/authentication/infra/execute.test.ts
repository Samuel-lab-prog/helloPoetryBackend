import { JwtTokenService } from './JwtTokenService';
import type { TokenPayload } from '../ports/Services';

import { it, expect, describe, beforeAll } from 'bun:test';

let token: string;
const payload: TokenPayload = {
	clientId: 1,
	role: 'admin',
	email: 'admin@example.com',
};
const expiresIn = 3600;

describe('JwtTokenService', () => {
	beforeAll(() => {
		token = JwtTokenService.generateToken(payload, expiresIn);
	});

	it('Should generate a token that can be verified', () => {
		const token = JwtTokenService.generateToken(payload, expiresIn);
		const decoded = JwtTokenService.verifyToken(token);

		expect(decoded).toMatchObject(payload);
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

	it('Should return null for an expired token', async () => {
		const shortToken = JwtTokenService.generateToken(payload, 1);

		await new Promise((r) => setTimeout(r, 1100));

		const decoded = JwtTokenService.verifyToken(shortToken);
		expect(decoded).toBeNull();
	});
});
