# Server Config Security Notes

This document summarizes what the backend already protects against and which
security controls are in place.

## Quick Start

1. Keep these environment variables defined in production:
   - `JWT_SECRET_KEY`
   - `CORS_ORIGIN` or `FRONTEND_URL`
   - `TRUST_PROXY` and `TRUSTED_PROXY_IPS` (if behind a proxy)
   - `MAX_AVATAR_UPLOAD_BYTES`
   - `MAX_POEM_AUDIO_UPLOAD_BYTES`
   - `BODY_LIMIT_BYTES`
   - `CSRF_ENABLED`
2. Use HTTPS in production for cookies and asset URLs.
3. Only enable cross-site cookies if strictly required.

## What The Server Is Protected Against

- XSS via untrusted inputs (server-side sanitization and schema validation).
- Malformed or oversized payloads (schema validation + body size limit).
- Brute-force password guessing (bcrypt + login lockout).
- Basic CSRF (token validation on unsafe methods).
- Abuse spikes (global and auth-specific rate limits).
- Upload abuse (MIME allowlists + S3 presigned POST size limits).
- Unauthorized access (role/status checks and policy gates).

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
- Cookies:
  - HTTP-only cookies are used.
  - `SameSite` and `Secure` are set based on environment and cross-site
    configuration.
- CSRF protection:
  - A CSRF cookie is set at login.
  - Unsafe methods require `x-csrf-token` to match the cookie value.
  - Enabled by `CSRF_ENABLED=true` or when cross-site cookies are used.
- Rate limiting:
  - Global and auth-specific rate limits are enabled.
  - Proxy trust uses an allowlist to avoid spoofing.
- Error normalization:
  - Centralized error handling avoids leaking internal details.
- Upload security:
  - Presigned POSTs enforce content type and size limits on S3.
  - Allowed MIME types are restricted for image and audio uploads.
- Access control:
  - Role and status checks are enforced in use-cases and policies.

## Notes

- If you enable cross-site cookies, CSRF is automatically enabled and required.
- If you expose public search endpoints, keep length and pattern limits in sync
  with schemas.
