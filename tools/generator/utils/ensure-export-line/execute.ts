import { readFileSafe, writeFileSafe } from '../files-utils/execute';
/**
 * Ensures that a specific export line exists in an index file.
 * Deduplicates existing lines.
 * Creates directories and the file if necessary.
 * @param indexPath Path to the index file
 * @param exportLine Export line to ensure
 */
export async function ensureExportLine(
	indexPath: string,
	exportLine: string,
): Promise<void> {
	const content = await readFileSafe(indexPath, '');

	const lines = new Set(
		content
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean),
	);

	lines.add(exportLine.trim());

	await writeFileSafe(indexPath, Array.from(lines).join('\n') + '\n');
}
