import type { StorageService } from '@SharedKernel/ports/Storage';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InternalServerError } from '@GenericSubdomains/utils/domainError';
import { log } from '@GenericSubdomains/utils/logger';

const allowedImageTypes = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
]);

const contentTypeToExtension: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
};

const region = process.env.AWS_REGION ?? 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME ?? 'hellopoetry1392781';
const signedUrlExpiresInSeconds = Number(process.env.S3_SIGNED_URL_EXPIRES_IN ?? 300);
const defaultPublicBaseUrl =
	process.env.S3_PUBLIC_BASE_URL ?? `https://${bucketName}.s3.amazonaws.com`;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;

const s3Client =
	accessKeyId && secretAccessKey
		? new S3Client({
				region,
				credentials: {
					accessKeyId,
					secretAccessKey,
					sessionToken,
				},
			})
		: new S3Client({ region });

export const storageService: StorageService = {
	validateImageContentType(contentType: string): boolean {
		return allowedImageTypes.has(contentType.toLowerCase());
	},
	async generateAvatarUploadUrl(userId: string, contentType?: string) {
		if (!bucketName) 
			throw new InternalServerError('S3 bucket name is not configured');
	
		if (!region) 
			throw new InternalServerError('AWS region is not configured');
		

		const id = crypto.randomUUID();
		const resolvedContentType = contentType?.toLowerCase();
		const ext =
			(resolvedContentType && contentTypeToExtension[resolvedContentType]) ||
			contentTypeToExtension['image/jpeg'];
		const objectKey = `avatars/${userId}/${id}.${ext}`;
		const fileUrl = `${defaultPublicBaseUrl}/${objectKey}`;

		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: objectKey,
			ContentType: resolvedContentType ?? 'image/jpeg',
		});

		let uploadUrl: string;
		try {
			uploadUrl = await getSignedUrl(s3Client, command, {
				expiresIn: signedUrlExpiresInSeconds,
			});
		} catch (error) {
			log.error(
				{
					error,
					bucketName,
					region,
					objectKey,
					hasAccessKey: !!accessKeyId,
				},
				'Failed to generate S3 signed URL',
			);
			throw new InternalServerError('Failed to generate avatar upload URL');
		}

		return {
			uploadUrl,
			fileUrl,
		};
	},
};
