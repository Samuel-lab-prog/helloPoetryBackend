export type AvatarUploadUrlResult = {
	uploadUrl: string;
	fileUrl: string;
};

export type AudioUploadUrlResult = {
	uploadUrl: string;
	fileUrl: string;
};

export interface StorageService {
	generateAvatarUploadUrl(
		userId: string,
		contentType?: string,
	): Promise<AvatarUploadUrlResult>;
	validateImageContentType(contentType: string): boolean;
	generatePoemAudioUploadUrl(
		poemId: string,
		contentType?: string,
	): Promise<AudioUploadUrlResult>;
	validateAudioContentType(contentType: string): boolean;
}
