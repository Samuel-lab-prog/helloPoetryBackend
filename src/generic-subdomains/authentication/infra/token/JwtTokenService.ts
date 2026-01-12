import jwt, { type SignOptions } from 'jsonwebtoken';
import { AppError } from '@AppError';
import type { TokenService, TokenPayload } from '../../ports/TokenService';

const secretKey = String(process.env.JWT_SECRET_KEY);
if (!secretKey) {
	throw new AppError({
		statusCode: 500,
		errorMessages: ['JWT_SECRET_KEY is not defined in environment variables'],
	});
}

function generateToken(payload: TokenPayload, expiresIn: number): string {
	const options: SignOptions = {
		algorithm: 'HS256',
		expiresIn,
		encoding: 'utf8',
	};
	return jwt.sign(payload, secretKey, options);
}

function verifyToken(token: string): TokenPayload | null {
	try {
		return jwt.verify(token, secretKey) as TokenPayload;
	} catch {
		return null;
	}
}

export const JwtTokenService: TokenService = {
	generateToken,
	verifyToken,
};
