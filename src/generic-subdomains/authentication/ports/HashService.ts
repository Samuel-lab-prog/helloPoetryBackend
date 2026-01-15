export interface HashService {
	compare(password: string, hashedPassword: string): Promise<boolean>;
	hash(password: string): Promise<string>;
}
