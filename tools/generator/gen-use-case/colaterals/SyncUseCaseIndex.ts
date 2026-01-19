import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function SyncUseCaseIndex(
	domain: string,
	isCommand: boolean,
	name: string,
) {
	const indexPath = join(
		'src',
		'domains',
		domain,
		'use-cases',
		isCommand ? 'commands' : 'queries',
		'Index.ts',
	);

	let content = '';
	try {
		content = await readFile(indexPath, 'utf-8');
	} catch {
		await writeFile(indexPath, '', 'utf-8');
	}

	const exportLine = `export * from './${name}/execute';\n`;
	if (!content.includes(exportLine)) {
		await writeFile(indexPath, content + exportLine, 'utf-8');
	}
}
