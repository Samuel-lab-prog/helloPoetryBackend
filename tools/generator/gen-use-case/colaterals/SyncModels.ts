import { join } from 'path';
import { ensureFileExists } from '../../utils/FilesUtils';
import { ensureExportLine } from '../../utils/ExportUtils';

export async function SyncModels(
	domain: string,
	isCommand: boolean,
	dataModels: string[],
) {
	const basePath = join(
		'src',
		'domains',
		domain,
		'use-cases',
		isCommand ? 'commands/command-models' : 'queries/read-models',
	);

	const indexPath = join(basePath, 'Index.ts');

	for (const dataModel of dataModels) {
		const modelPath = join(basePath, `${dataModel}.ts`);
		await ensureFileExists(
			modelPath,
			`export interface ${dataModel} { /* TODO */ }\n`,
		);
		const exportLine = `export * from './${dataModel}';\n`;
		await ensureExportLine(indexPath, exportLine);
	}
}
