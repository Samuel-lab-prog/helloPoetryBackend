import { readFile, writeFile } from 'fs/promises';

/**
 * Ensures that a file exists, creating it with initial content if necessary.
 */
export async function ensureFileExists(
	filePath: string,
	initialContent: string = '',
) {
	try {
		await readFile(filePath, 'utf-8');
	} catch {
		await writeFile(filePath, initialContent, 'utf-8');
	}
}

/**
 * Ensures that an export line is present in the file.
 */
export async function ensureExportLine(indexPath: string, line: string) {
	await ensureFileExists(indexPath);
	let content = await readFile(indexPath, 'utf-8');
	if (!content.includes(line)) {
		content += line;
		await writeFile(indexPath, content, 'utf-8');
	}
}
