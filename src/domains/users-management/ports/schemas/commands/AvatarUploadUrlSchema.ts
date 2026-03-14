import { t } from 'elysia';

export const AvatarUploadUrlSchema = t.Object({
	uploadUrl: t.String(),
	fileUrl: t.String(),
});
