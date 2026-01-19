import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';

export async function updateDatabaseRepository(
	domain: string,
	isCommand: boolean,
	dataModel: string,
) {
	const repositoryPath = join(
		'src',
		'domains',
		domain,
		'ports',
		isCommand ? 'CommandsRepository.ts' : 'QueriesRepository.ts',
	);

	// Lê o conteúdo do arquivo
	let content: string;
	try {
		content = await readFile(repositoryPath, 'utf-8');
	} catch {
		throw new Error(`Repository file not found: ${repositoryPath}`);
	}

	// Nome do método que será adicionado
	const methodName = isCommand ? `execute${dataModel}` : `select${dataModel}`;

	// Verifica se o método já existe
	if (content.includes(methodName)) {
		console.log(`✔ Method ${methodName} already exists in repository.`);
		return;
	}

	// Regex para localizar o final da interface
	const match = content.match(/export\s+interface\s+\w+\s*{([\s\S]*?)}/);
	if (!match) {
		throw new Error(`Cannot find interface in repository: ${repositoryPath}`);
	}

	const interfaceBody = match[1];

	// Adiciona o novo método (parâmetros genéricos, Promise<any>)
	const newMethod = `  ${methodName}(params: ${dataModel}): Promise<any>;\n`;

	// Substitui o corpo da interface com o novo método
	const updatedContent = content.replace(
		match[0],
		match[0].replace(interfaceBody!, interfaceBody + newMethod),
	);

	// Escreve de volta no arquivo
	await writeFile(repositoryPath, updatedContent, 'utf-8');

	console.log(`✔ Added method ${methodName} to repository: ${repositoryPath}`);
}
