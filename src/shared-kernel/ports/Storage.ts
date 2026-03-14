export type AvatarUploadUrlResult = {
	uploadUrl: string;
	fileUrl: string;
};

export interface StorageService {
	generateAvatarUploadUrl(
		userId: string,
		contentType?: string,
	): Promise<AvatarUploadUrlResult>;
	validateImageContentType(contentType: string): boolean;
}
