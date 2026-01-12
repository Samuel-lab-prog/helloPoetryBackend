import jwt, { type SignOptions } from 'jsonwebtoken';
import type { TokenService, TokenPayload } from '../../ports/TokenService';

const secretKey = String(process.env.JWT_SECRET_KEY);

function generateToken(payload: TokenPayload, expiresIn: number): string {
	const options: SignOptions = {
		algorithm: 'HS256',
		expiresIn,
	};
	return jwt.sign(payload, secretKey, options);
}

function verifyToken(token: string): TokenPayload | null {
	try {
		const decoded = jwt.verify(token, secretKey);

		if (
			typeof decoded === 'object' &&
			decoded !== null &&
			'clientId' in decoded &&
			'email' in decoded &&
			'role' in decoded
		) {
			return decoded as TokenPayload;
		}

		return null;
	} catch {
		return null;
	}
}

export const JwtTokenService: TokenService = {
	generateToken,
	verifyToken,
};
