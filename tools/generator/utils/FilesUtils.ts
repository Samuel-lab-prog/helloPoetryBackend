import { readFile, writeFile } from 'fs/promises';

/**
 * Reads a file safely. If the file does not exist, creates it with optional initial content.
 *
 * @param filePath Path to the file
 * @param initialContent Content to write if the file does not exist
 * @returns File content
 */
export async function readFileSafe(
	filePath: string,
	initialContent: string = '',
): Promise<string> {
	try {
		return await readFile(filePath, 'utf-8');
	} catch {
		await writeFile(filePath, initialContent, 'utf-8');
		return initialContent;
	}
}

/**
 * Writes content to a file.
 *
 * @param filePath Path to the file
 * @param content Content to write
 */
export async function writeFileSafe(
	filePath: string,
	content: string,
): Promise<void> {
	await writeFile(filePath, content, 'utf-8');
}

/**
 * Ensures that a file exists, creating it with initial content if necessary.
 *
 * @param filePath Path to the file
 * @param initialContent Content to write if the file does not exist
 */
export async function ensureFileExists(
	filePath: string,
	initialContent: string = '',
): Promise<void> {
	await readFileSafe(filePath, initialContent);
}
