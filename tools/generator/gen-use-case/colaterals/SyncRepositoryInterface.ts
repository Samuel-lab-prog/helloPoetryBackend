import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function SyncRepositoryInterface(
	domain: string,
	isCommand: boolean,
	dataModel: string,
	useCaseName: string,
) {
	const repositoryPath = join(
		'src',
		'domains',
		domain,
		'ports',
		isCommand ? 'CommandsRepository.ts' : 'QueriesRepository.ts',
	);

	let content: string;
	try {
		content = await readFile(repositoryPath, 'utf-8');
	} catch {
		throw new Error(`Repository file not found: ${repositoryPath}`);
	}

	const methodName = isCommand ? `execute${useCaseName}` : `select${dataModel}`;
	const importPath = `../use-cases/${isCommand ? 'commands' : 'queries'}/read-models/Index`;

	// Extrai todos os tipos já importados
	const existingImportsMatch = content.match(
		/import type {([\s\S]*?)} from ['"].*?Index['"]/m,
	);
	const existingTypes: string[] = existingImportsMatch
		? existingImportsMatch[1]!.split(',').map((t) => t.trim())
		: [];

	if (!existingTypes.includes(dataModel)) existingTypes.push(dataModel);

	const newImport = `import type { ${existingTypes.join(', ')} } from '${importPath}';`;

	content = content.replace(
		/import type {[\s\S]*?} from ['"].*?Index['"];\n*/g,
		'',
	);
	content = newImport + '\n\n' + content;

	const match = content.match(/export\s+interface\s+\w+\s*{([\s\S]*?)^\}/m);
	if (!match)
		throw new Error(`Cannot find interface in repository: ${repositoryPath}`);

	const interfaceBody = match[1];
	const newMethod = `  ${methodName}(params: { requesterId: number }): Promise<${dataModel}[]>;\n`;

	const updatedContent = content.replace(
		match[0],
		match[0].replace(interfaceBody!, interfaceBody + newMethod),
	);
	await writeFile(repositoryPath, updatedContent, 'utf-8');
}
