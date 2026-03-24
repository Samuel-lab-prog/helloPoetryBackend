# Server Config Security Notes

This document summarizes the security practices that are already implemented in the backend.
It is intentionally short and practical, so new contributors can quickly understand the baseline.

## Quick Start
1. Keep environment variables defined for production:
   - `JWT_SECRET_KEY`
   - `CORS_ORIGIN` or `FRONTEND_URL`
   - `TRUST_PROXY` and `TRUSTED_PROXY_IPS` (if behind a proxy)
   - `MAX_AVATAR_UPLOAD_BYTES`
   - `MAX_POEM_AUDIO_UPLOAD_BYTES`
2. Use HTTPS in production for cookies and asset URLs.
3. Do not enable cross-site cookies unless strictly required.

## Adopted Security Practices
- Input sanitization:
  - Global string sanitization is applied in `ELYSIA_SETTINGS` to reduce XSS risk.
- Input validation with strict schemas:
  - Requests validate types, limits, and formats (e.g. poem content size, nickname format, pagination limits).
- Password hashing:
  - Bcrypt is used with a configurable cost (`BCRYPT_SALT_ROUNDS`) and a safe default.
- JWT handling:
  - JWTs are signed with a secret from environment (`JWT_SECRET_KEY`).
- Cookies:
  - HTTP-only cookies are used.
  - `SameSite` and `Secure` are set based on environment and cross-site configuration.
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
- If you enable cross-site cookies, consider adding CSRF protection.
- If you expose public search endpoints, keep length and pattern limits in sync with schemas.
