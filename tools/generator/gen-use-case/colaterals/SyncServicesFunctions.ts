import { writeFile } from 'fs/promises';
import { join } from 'path';
import { toCamelCase, toPascalCase } from '../../utils/StringUtils';
import { readFileSafe } from '../../utils/FilesUtils';

interface ServiceMethod {
	name: string;
	parameters: { name: string; type: string }[];
	returnTypes: string[];
}

/**
 * Synchronizes a service file with:
 * - repository import
 * - factories imports
 * - types imports
 * - interface declaration
 * - service bindings
 *
 * @param domain Domain name
 * @param isCommand Whether it's a command or query service
 * @param serviceMethods Methods to generate (name, parameters, returnTypes)
 * @param typeImports Types to import
 */
export async function syncServicesFile(
	domain: string,
	isCommand: boolean,
	serviceMethods: ServiceMethod[],
	typeImports: string[],
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
	let content = await readFileSafe(servicesFilePath);

	// 🔹 Imports
	const repositoryImport = `import { ${toCamelCase(typeFolder)}Repository } from '../../../infra/${typeFolder}-repository/repository';\n`;

	const factoryNames = serviceMethods.map((m) => m.name + 'Factory');
	const factoriesImport = factoryNames.length
		? `import {\n\t${factoryNames.join(',\n\t')},\n} from '../../../use-cases/${typeFolder}/index';\n`
		: '';

	const typesImport = typeImports.length
		? `import type {\n\t${typeImports.join(',\n\t')},\n} from '../../../use-cases/${typeFolder}/${isCommand ? 'command-models' : 'read-models'}/Index';\n`
		: '';

	// 🔹 Interface
	const interfaceName = `${toPascalCase(typeFolder)}RouterServices`;
	const interfaceContent = `export interface ${interfaceName} {\n${serviceMethods
		.map(
			(m) =>
				`\t${m.name}: ({ ${m.parameters.map((p) => p.name).join(', ')} }: { ${m.parameters.map((p) => `${p.name}: ${p.type}`).join('; ')} }) => Promise<${m.returnTypes.join(' | ')}>;`,
		)
		.join('\n')}\n}\n`;

	// 🔹 Service bindings
	const objectName = `${toCamelCase(domain)}${toPascalCase(typeFolder)}Services`;
	const objectContent = `export const ${objectName}: ${interfaceName} = {\n${serviceMethods
		.map(
			(m) =>
				`\t${m.name}: ${m.name}Factory({ ${toCamelCase(typeFolder)}Repository: ${toCamelCase(
					typeFolder,
				)}Repository }),`,
		)
		.join('\n')}\n};\n`;

	// 🔹 Monta conteúdo final
	content =
		repositoryImport +
		'\n' +
		factoriesImport +
		'\n' +
		typesImport +
		'\n' +
		interfaceContent +
		'\n' +
		objectContent;

	await writeFile(servicesFilePath, content, 'utf-8');
}
