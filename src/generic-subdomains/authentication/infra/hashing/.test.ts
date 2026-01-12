import { BcryptHashService } from './BcryptHashService';
import { it, expect, describe, beforeAll } from 'bun:test';

let password: string;
let hashedPassword: string;

describe('BcryptHashService', () => {
	beforeAll(async () => {
		password = 'StrongPassword123!';
		hashedPassword = await BcryptHashService.hash(password);
	});

	it('Should hash a password correctly', () => {
		expect(hashedPassword).toBeDefined();
		expect(hashedPassword).not.toBe(password);
		expect(hashedPassword.length).toBeGreaterThan(30);
	});
	it('Should compare a password with its hash successfully', async () => {
		const isMatch = await BcryptHashService.compare(password, hashedPassword);
		expect(isMatch).toBe(true);
	});

	it('Should fail to compare a wrong password', async () => {
		const isMatch = await BcryptHashService.compare(
			'WrongPassword',
			hashedPassword,
		);
		expect(isMatch).toBe(false);
	});
});
