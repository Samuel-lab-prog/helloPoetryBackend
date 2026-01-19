import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function SyncModels(
	domain: string,
	isCommand: boolean,
	useCaseName: string,
	dataModel: string,
) {
	const basePath = join(
		'src',
		'domains',
		domain,
		'use-cases',
		isCommand ? 'commands/command-models' : 'queries/read-models',
	);

	const modelPath = join(basePath, `${dataModel}.ts`);
	const indexPath = join(basePath, 'Index.ts');

	try {
		await readFile(modelPath, 'utf-8');
		console.log(`✔ Model already exists: ${modelPath}`);
	} catch {
		await writeFile(
			modelPath,
			`export interface ${dataModel} { /* TODO */ }\n`,
			'utf-8',
		);
	}

	let indexContent = '';
	try {
		indexContent = await readFile(indexPath, 'utf-8');
	} catch {
		await writeFile(indexPath, '', 'utf-8');
	}

	const exportLine = `export * from './${dataModel}';\n`;
	if (!indexContent.includes(exportLine)) {
		await writeFile(indexPath, indexContent + exportLine, 'utf-8');
	}
}
