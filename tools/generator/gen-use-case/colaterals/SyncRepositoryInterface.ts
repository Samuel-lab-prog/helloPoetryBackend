import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ensureImports } from '../../utils/EnsureImports';

export async function SyncRepositoryInterface(
	domain: string,
	isCommand: boolean,
	dataModels: string[],
	repositoryMethods: {
		name: string;
		parameters: string[];
		returnTypes: string[];
	}[],
) {
	const repositoryPath = join(
		'src',
		'domains',
		domain,
		'ports',
		isCommand ? 'CommandsRepository.ts' : 'QueriesRepository.ts',
	);

	// Ensures that types are imported
	const importPath = `../use-cases/${isCommand ? 'commands' : 'queries'}/read-models/Index`;
	const content = await ensureImports(
		repositoryPath,
		importPath,
		dataModels,
		true,
	);

	// Finds the interface definition
	const match = content.match(/export\s+interface\s+\w+\s*{([\s\S]*?)^\}/m);
	if (!match)
		throw new Error(`Cannot find interface in repository: ${repositoryPath}`);

	const interfaceBody = match[1];

	// Adds all methods (supports multiple repositoryMethods)
	let newMethods = '';
	if (repositoryMethods && repositoryMethods.length > 0) {
		for (const m of repositoryMethods) {
			const params = m.parameters
				.map((p) => `${p.split(':')[0]}: ${p.split(':')[1]?.trim() || 'any'}`)
				.join(', ');
			const returnType = m.returnTypes.join(' | ');
			newMethods += `  ${m.name}(params: { ${params} }): Promise<${returnType}>;\n`;
		}
	}

	const updatedContent = content.replace(
		match[0],
		match[0].replace(interfaceBody!, interfaceBody + newMethods),
	);

	await writeFile(repositoryPath, updatedContent, 'utf-8');
}
