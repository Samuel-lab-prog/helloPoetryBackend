import kleur from 'kleur';
import { MissingEnvVarError } from '@AppError';
import { parseBoolean } from './envParsers';

type EnvName = Parameters<typeof MissingEnvVarError>[0];

const isBlank = (value: string | undefined) =>
	!value || value.trim().length === 0;

const ALL_ENV_VARS: EnvName[] = [
	'DATABASE_URL',
	'JWT_SECRET_KEY',
	'CORS_ORIGIN',
	'FRONTEND_URL',
	'S3_BUCKET_NAME',
	'AWS_REGION',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'S3_PUBLIC_BASE_URL',
	'TRUST_PROXY',
	'TRUSTED_PROXY_IPS',
	'CSRF_ENABLED',
	'AUTH_LOCKOUT_DURATION_MS',
	'AUTH_LOCKOUT_THRESHOLD',
	'AUTH_LOCKOUT_WINDOW_MS',
	'AUTH_RATE_LIMIT_DURATION_MS',
	'AUTH_RATE_LIMIT_MAX',
	'AWS_SESSION_TOKEN',
	'BCRYPT_SALT_ROUNDS',
	'BODY_LIMIT_BYTES',
	'CDN_URL_ALLOWLIST',
	'COOKIE_DOMAIN',
	'CROSS_SITE_COOKIES',
	'CSRF_ORIGIN_ALLOWLIST',
	'CSRF_SKIP_PATHS',
	'JWT_AUDIENCE',
	'JWT_ISSUER',
	'JWT_REQUIRE_CLAIMS',
	'MAX_AVATAR_UPLOAD_BYTES',
	'MAX_POEM_AUDIO_UPLOAD_BYTES',
	'NODE_ENV',
	'PORT',
	'RATE_LIMIT_CONTEXT_SIZE',
	'RATE_LIMIT_ERROR_JSON',
	'RATE_LIMIT_HEADERS',
	'RATE_LIMIT_SKIP_PATHS',
	'S3_SIGNED_URL_EXPIRES_IN',
	'SECURITY_HEADERS_ENABLED',
];

type ValidateEnvOptions = {
	silent?: boolean;
};

const buildRequiredVars = (): EnvName[] => {
	const NODE_ENV = process.env.NODE_ENV ?? 'development';
	const isProd = NODE_ENV === 'production';
	const isTest = NODE_ENV === 'test';

	const crossSiteCookies = parseBoolean({
		value: process.env.CROSS_SITE_COOKIES,
		fallback: false,
	});
	const trustProxy = parseBoolean({
		value: process.env.TRUST_PROXY,
		fallback: false,
	});

	const required: EnvName[] = [];
	if (isProd) required.push('DATABASE_URL');
	if (!isTest) required.push('JWT_SECRET_KEY');
	if (isProd && crossSiteCookies) required.push('CORS_ORIGIN');
	if (trustProxy) required.push('TRUSTED_PROXY_IPS');

	return required;
};

/**
 * Validates required environment variables for server startup.
 * Throws when a required value is missing.
 */
export function validateServerEnv(options: ValidateEnvOptions = {}): void {
	const { silent = false } = options;
	const requiredVars = buildRequiredVars();
	const requiredSet = new Set(requiredVars);
	const missingRequired: EnvName[] = [];
	const setVars: EnvName[] = [];
	const optionalVars: EnvName[] = [];
	const missingVars: EnvName[] = [];

	try {
		for (const name of ALL_ENV_VARS) {
			const value = process.env[name];
			const isSet = !isBlank(value);
			const isRequired = requiredSet.has(name);

			if (isSet) {
				setVars.push(name);
				continue;
			}

			if (isRequired) {
				missingRequired.push(name);
				missingVars.push(name);
				continue;
			}

			optionalVars.push(name);
		}

		if (!silent) {
			for (const name of setVars) console.log(kleur.green(`SET -> ${name}`));
			for (const name of optionalVars)
				console.log(kleur.yellow(`OPTIONAL -> ${name}`));
			for (const name of missingVars)
				console.log(kleur.red(`MISSING -> ${name}`));
		}

		if (missingRequired.length > 0)
			throw MissingEnvVarError(missingRequired[0]!);

		if (!silent) console.log(kleur.green('Env check passed.'));
	} catch (error) {
		if (!silent) console.error(kleur.red('Env check failed.'));
		throw error;
	}
}
