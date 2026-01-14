import bcrypt from 'bcryptjs';
import type { HashServices } from '../../ports/HashSerices';

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);

function hash(password: string): Promise<string> {
	return bcrypt.hash(password, saltRounds);
}

function compare(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export const BcryptHashService: HashServices = {
	hash,
	compare,
};
