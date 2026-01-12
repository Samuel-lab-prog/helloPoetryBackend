import bcrypt from 'bcryptjs';
import { AppError } from '@AppError';
import type { HashService } from '../../ports/HashService';

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
if (!saltRounds || isNaN(saltRounds)) {
	throw new AppError({
		statusCode: 500,
		errorMessages: [
			'BCRYPT_SALT_ROUNDS is not defined or invalid in environment variables',
		],
	});
}

function hash(password: string): Promise<string> {
	return bcrypt.hash(password, saltRounds);
}

function compare(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export const BcryptHashService: HashService = {
	hash,
	compare,
};
