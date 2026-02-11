import type { AuthClient, LoginResponse } from '../use-cases/Models';

export interface AuthControllerServices {
	login: (email: string, password: string) => Promise<LoginResponse>;
}

export interface AuthPluginServices {
	authenticate: (token: string) => Promise<AuthClient>;
}
