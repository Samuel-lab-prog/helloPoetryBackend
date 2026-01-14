export interface HashService {
	compare(password: string, hashedPassword: string): Promise<boolean>;
}
