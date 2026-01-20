import { readFileSafe, writeFileSafe } from './FilesUtils';

/**
 * Ensures that a specific export line exists in a file.
 * If the line is missing, it is appended to the end of the file.
 *
 * @param indexPath Path to the file
 * @param exportLine Line to ensure is present
 * @example
 * await ensureExportLine('src/index.ts', "export * from './my-module';");
 */
export async function ensureExportLine(
	indexPath: string,
	exportLine: string,
): Promise<void> {
	let content = await readFileSafe(indexPath);

	if (!content.includes(exportLine)) {
		content += content.endsWith('\n') ? '' : '\n';
		content += exportLine + '\n';
		await writeFileSafe(indexPath, content);
	}
}
