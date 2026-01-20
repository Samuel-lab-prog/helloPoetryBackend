import { join } from 'path';
import { ensureFileExists } from '../../utils/FilesUtils';
import { ensureExportLine } from '../../utils/ExportUtils';

export async function SyncModels(
	domain: string,
	isCommand: boolean,
	dataModels: { name: string; properties: Record<string, string> }[],
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
		const modelPath = join(basePath, `${dataModel.name}.ts`);
		await ensureFileExists(
			modelPath,
			`export interface ${dataModel.name} {\n${Object.entries(
				dataModel.properties,
			)
				.map(([key, type]) => `\t${key}: ${type};`)
				.join('\n')}\n}\n`,
		);
		const exportLine = `export * from './${dataModel.name}';\n`;
		await ensureExportLine(indexPath, exportLine);
	}
}
