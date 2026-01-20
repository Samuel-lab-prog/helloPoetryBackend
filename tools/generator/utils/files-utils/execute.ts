import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

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
		await writeFileSafe(filePath, initialContent);
		return initialContent;
	}
}

/**
 * Writes content to a file, creating directories if they do not exist.
 *
 * @param filePath Path to the file
 * @param content Content to write
 */
export async function writeFileSafe(
	filePath: string,
	content: string,
): Promise<void> {
	await mkdir(dirname(filePath), { recursive: true });
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

/**
 * Ensures that a specific export line exists in a file.
 * If the line is missing, it is appended to the end of the file.
 * Creates directories and the file if necessary, and evita duplicatas sutis.
 *
 * @param indexPath Path to the file
 * @param exportLine Line to ensure is present
 * @example
 * await ensureExportLine('src/index.ts', "export * from './my-module';");
 */
