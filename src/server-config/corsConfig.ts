const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const RAW_CORS_ORIGINS = process.env.CORS_ORIGIN ?? FRONTEND_URL ?? '';

const corsOrigins = RAW_CORS_ORIGINS.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

if (NODE_ENV === 'production' && corsOrigins.length === 0) {
	// Avoid logger import here to prevent circular deps with server-config.
	console.warn(
		'Missing CORS_ORIGIN/FRONTEND_URL in production. Cross-site cookies will be blocked.',
	);
}

export const corsConfig = {
	credentials: true,
	allowedHeaders: [
		'content-type',
		'authorization',
		'x-csrf-token',
		'x-requested-with',
	] as string[],
	origin: (request: Request) => {
		const origin = request.headers.get('origin') ?? '';
		if (!origin) return true;
		if (corsOrigins.length === 0) return NODE_ENV !== 'production';
		return corsOrigins.includes(origin);
	},
};

export function hasCrossSiteCors(): boolean {
	return !!FRONTEND_URL || corsOrigins.length > 0;
}
