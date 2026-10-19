import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { SecurityHeadersPlugin } from './securityHeadersPlugin';

describe('UNIT - Security headers plugin composition', () => {
	it('applies security headers to routes composed by the parent server', async () => {
		const app = new Elysia()
			.use(SecurityHeadersPlugin)
			.get('/probe', () => ({ ok: true }));

		const response = await app.handle(new Request('http://localhost/probe'));

		expect(response.status).toBe(200);
		expect(response.headers.get('x-content-type-options')).toBe('nosniff');
		expect(response.headers.get('x-frame-options')).toBe('DENY');
		expect(response.headers.get('referrer-policy')).toBe(
			'strict-origin-when-cross-origin',
		);
	});
});
