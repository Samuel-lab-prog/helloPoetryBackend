import { log } from '@GenericSubdomains/utils/logger';

const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const RAW_CORS_ORIGINS = process.env.CORS_ORIGIN ?? FRONTEND_URL ?? '';

const corsOrigins = RAW_CORS_ORIGINS.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

if (NODE_ENV === 'production' && corsOrigins.length === 0) {
	log.warn(
		'Missing CORS_ORIGIN/FRONTEND_URL in production. Cross-site cookies will be blocked.',
	);
}

export const corsConfig = {
	credentials: true,
	origin: (request: Request) => {
		const origin = request.headers.get('origin') ?? '';
		if (!origin) return true;
		if (corsOrigins.length === 0) return NODE_ENV !== 'production';
		return corsOrigins.includes(origin);
	},
} as const;

export function hasCrossSiteCors(): boolean {
	return !!FRONTEND_URL || corsOrigins.length > 0;
}
