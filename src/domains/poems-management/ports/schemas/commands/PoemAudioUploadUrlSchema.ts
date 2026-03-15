import { t } from 'elysia';

export const PoemAudioUploadUrlSchema = t.Object({
	uploadUrl: t.String(),
	fileUrl: t.String(),
});
