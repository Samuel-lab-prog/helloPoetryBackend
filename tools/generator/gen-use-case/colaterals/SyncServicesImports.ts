import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { toCamelCase } from '../../utils/index.ts';

export async function SyncServicesImports(
	domain: string,
	isCommand: boolean,
	useCaseNames: string[],
	dataModelTypes: string[],
) {
	const typeFolder = isCommand ? 'commands' : 'queries';
	const servicesFilePath = join(
		'src',
		'domains',
		domain,
		'adapters',
		'http',
		typeFolder,
		'Services.ts',
	);

	// eslint-disable-next-line no-useless-assignment
	let content = '';
	try {
		content = await readFile(servicesFilePath, 'utf-8');
	} catch {
		await writeFile(servicesFilePath, '', 'utf-8');
		content = '';
	}

	// 🔹 Detecta se já existe um import consolidado de factories
	const factoryRegex = new RegExp(
		`import\\s+\\{([\\s\\S]*?)\\}\\s+from\\s+'\\.\\.\\/\\.\\.\\/\\.\\.\\/use-cases\\/${typeFolder}'`,
	);
	const existingFactoriesMatch = content.match(factoryRegex);
	let existingFactories: string[] = [];
	if (existingFactoriesMatch) {
		existingFactories = existingFactoriesMatch[1]!
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	// 🔹 Detecta se já existe um import consolidado de types
	const modelsPath = `../../../use-cases/${typeFolder}/${isCommand ? 'command-models' : 'read-models'}/Index`;
	const typesRegex = new RegExp(
		`import\\s+type\\s+\\{([\\s\\S]*?)\\}\\s+from\\s+'${modelsPath}'`,
	);
	const existingTypesMatch = content.match(typesRegex);
	let existingTypes: string[] = [];
	if (existingTypesMatch) {
		existingTypes = existingTypesMatch[1]!
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	// 🔹 Junta novos factories e types sem duplicar
	const factoryNames = useCaseNames.map(
		(name) => `${toCamelCase(name)}Factory`,
	);
	const allFactories = Array.from(
		new Set([...existingFactories, ...factoryNames]),
	);

	const allTypes = Array.from(new Set([...existingTypes, ...dataModelTypes]));

	const newContent = content
		.replace(factoryRegex, '')
		.replace(typesRegex, '')
		.trimStart();

	let imports = '';
	if (allFactories.length) {
		imports += `import { ${allFactories.join(', ')} } from '../../../use-cases/${typeFolder}';\n`;
	}
	if (allTypes.length) {
		imports += `import type { ${allTypes.join(', ')} } from '${modelsPath}';\n`;
	}

	const updatedContent = imports + newContent;

	await writeFile(servicesFilePath, updatedContent, 'utf-8');
}
