# Server Config Security Notes

This document summarizes what the backend already protects against and which
security controls are in place.

## Quick Start

1. Define the required production environment variables (see list below).
2. Use HTTPS in production for cookies and asset URLs.
3. Only enable cross-site cookies if strictly required.

## Environment Variables Used

### Required (Typical Production)

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `CORS_ORIGIN` or `FRONTEND_URL`
- `S3_BUCKET_NAME`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_PUBLIC_BASE_URL` (if not using the default AWS bucket URL)
- `TRUST_PROXY` (if behind a proxy)
- `TRUSTED_PROXY_IPS` (if `TRUST_PROXY=true`)
- `CSRF_ENABLED` (if using cross-site cookies)

### Optional / Defaults Available

- `AUTH_LOCKOUT_DURATION_MS`
- `AUTH_LOCKOUT_THRESHOLD`
- `AUTH_LOCKOUT_WINDOW_MS`
- `AUTH_RATE_LIMIT_DURATION_MS`
- `AUTH_RATE_LIMIT_MAX`
- `AWS_SESSION_TOKEN`
- `BCRYPT_SALT_ROUNDS`
- `BODY_LIMIT_BYTES`
- `CDN_URL_ALLOWLIST`
- `COOKIE_DOMAIN`
- `CROSS_SITE_COOKIES`
- `CSRF_ORIGIN_ALLOWLIST`
- `CSRF_SKIP_PATHS`
- `JWT_AUDIENCE`
- `JWT_ISSUER`
- `JWT_REQUIRE_CLAIMS`
- `MAX_AVATAR_UPLOAD_BYTES`
- `MAX_POEM_AUDIO_UPLOAD_BYTES`
- `NODE_ENV`
- `PORT`
- `RATE_LIMIT_CONTEXT_SIZE`
- `RATE_LIMIT_ERROR_JSON`
- `RATE_LIMIT_HEADERS`
- `RATE_LIMIT_SKIP_PATHS`
- `S3_SIGNED_URL_EXPIRES_IN`
- `SECURITY_HEADERS_ENABLED`

## What The Server Is Protected Against

- XSS via untrusted inputs (server-side sanitization and schema validation).
- Malformed or oversized payloads (schema validation + body size limit).
- Brute-force password guessing (bcrypt + login lockout).
- Basic CSRF (token validation on unsafe methods).
- CSRF from untrusted origins (Origin/Referer allowlist).
- Abuse spikes (global and auth-specific rate limits).
- Upload abuse (MIME allowlists + S3 presigned POST size limits).
- Unauthorized access (role/status checks and policy gates).
- Untrusted media URLs (CDN allowlist validation).

## Adopted Security Practices

- Input sanitization:
  - Global string sanitization is applied in `ELYSIA_SETTINGS` to reduce XSS
    risk.
- Input validation with strict schemas:
  - Requests validate types, limits, and formats (e.g. poem content size,
    nickname format, pagination limits).
- Body size limiting:
  - Requests are capped by `BODY_LIMIT_BYTES` (default 1 MB).
- Password hashing:
  - Bcrypt is used with a configurable cost (`BCRYPT_SALT_ROUNDS`) and a safe
    default.
- JWT handling:
  - JWTs are signed with a secret from environment (`JWT_SECRET_KEY`).
  - Optional issuer/audience/jti validation (`JWT_ISSUER`, `JWT_AUDIENCE`,
    `JWT_REQUIRE_CLAIMS`).
- Cookies:
  - HTTP-only cookies are used.
  - `SameSite` and `Secure` are set based on environment and cross-site
    configuration.
- CSRF protection:
  - A CSRF cookie is set at login.
  - Unsafe methods require `x-csrf-token` to match the cookie value.
  - Enabled by `CSRF_ENABLED=true` or when cross-site cookies are used.
  - Optional Origin/Referer allowlist (`CSRF_ORIGIN_ALLOWLIST`).
- Security headers:
  - HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
    Permissions-Policy.
  - Can be disabled with `SECURITY_HEADERS_ENABLED=false`.
- Rate limiting:
  - Global and auth-specific rate limits are enabled.
  - Proxy trust uses an allowlist to avoid spoofing.
- Error normalization:
  - Centralized error handling avoids leaking internal details.
- Upload security:
  - Presigned POSTs enforce content type and size limits on S3.
  - Allowed MIME types are restricted for image and audio uploads.
- CDN URL allowlist:
  - `avatarUrl` and `audioUrl` are validated against `CDN_URL_ALLOWLIST` when
    set.
- Access control:
  - Role and status checks are enforced in use-cases and policies.

## Notes

- If you enable cross-site cookies, CSRF is automatically enabled and required.
- If you expose public search endpoints, keep length and pattern limits in sync
  with schemas.

## Future Security Improvements

- Persist login lockout in Redis for multi-instance setups.
- Add JWT revocation (store and check `jti`).
- Audit sensitive events (login, password/email changes, uploads).
- Validate uploads after S3 (HeadObject + delete if invalid).
- Consider a WAF or application firewall for automated abuse.
