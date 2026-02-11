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

function isValidTokenPayload(payload: unknown): payload is TokenPayload {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'clientId' in payload &&
		typeof payload.clientId === 'number' &&
		'email' in payload &&
		typeof payload.email === 'string' &&
		'role' in payload &&
		typeof payload.role === 'string'
	);
}

function verifyToken(token: string): TokenPayload | null {
	try {
		const decoded = jwt.verify(token, secretKey);
		return isValidTokenPayload(decoded) ? decoded : null;
	} catch {
		return null;
	}
}

function fakeGenerateToken(payload: TokenPayload, _expiresIn: number): string {
	const role = payload.role;
	const email = payload.email;
	const clientId = payload.clientId;
	return `${role}-${email}-${clientId}`;
}

function fakeVerifyToken(token: string): TokenPayload | null {
	const parts = token.split('-');
	if (parts.length !== 3) return null;
	const [role, email, clientIdStr] = parts;
	const clientId = Number(clientIdStr);
	if (
		isNaN(clientId) ||
		(role !== 'admin' && role !== 'author' && role !== 'moderator') ||
		!email
	)
		return null;
	return { role, email, clientId };
}

export const JwtTokenService: TokenService = {
	generateToken,
	verifyToken,
};

export const FakeJwtTokenService: TokenService = {
	generateToken: fakeGenerateToken,
	verifyToken: fakeVerifyToken,
};
