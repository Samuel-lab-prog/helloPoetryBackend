import type { UserRole } from '@SharedKernel/Enums';

export type TokenPayload = {
	clientId: number;
	role: UserRole;
	email: string;
};

export interface TokenService {
	generateToken(payload: TokenPayload, expiresIn: number): string;
	verifyToken(token: string): TokenPayload | null;
}
