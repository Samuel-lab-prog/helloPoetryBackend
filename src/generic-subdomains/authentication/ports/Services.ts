import type { AuthClient, LoginResponse } from './Models';
import type { UserRole } from '@SharedKernel/Enums';

export interface AuthControllerServices {
	login: (email: string, password: string) => Promise<LoginResponse>;
}

export interface AuthPluginServices {
	authenticate: (token: string) => Promise<AuthClient>;
}

export type TokenPayload = {
	clientId: number;
	role: UserRole;
	email: string;
};

export interface TokenService {
	generateToken(payload: TokenPayload, expiresIn: number): string;
	verifyToken(token: string): TokenPayload | null;
}
