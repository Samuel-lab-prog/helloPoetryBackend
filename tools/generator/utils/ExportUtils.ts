import { readFileSafe, writeFileSafe } from './FilesUtils';

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
