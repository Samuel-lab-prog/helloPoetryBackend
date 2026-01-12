export type TokenPayload = {
	clientId: number;
	role: string;
	email: string;
};

export interface TokenService {
	generateToken(payload: TokenPayload, expiresIn: number): string;
	verifyToken(token: string): TokenPayload | null;
}
