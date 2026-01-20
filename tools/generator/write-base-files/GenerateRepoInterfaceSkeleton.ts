import { join } from 'path';
import { generateFile } from '../utils/TemplateUtils';

export async function generateRepositorySkeleton(domainName: string) {
	const queriesInterfacePath = join(
		'src',
		'domains',
		domainName,
		'ports',
		`QueriesRepository.ts`,
	);
	const commandsInterfacePath = join(
		'src',
		'domains',
		domainName,
		'ports',
		`CommandsRepository.ts`,
	);

	await generateFile(
		'repository-interface/RepositoryInterface.ts.tpl',
		queriesInterfacePath,
		{
			RepositoryName: 'QueriesRepository',
		},
	);
	await generateFile(
		'repository-interface/RepositoryInterface.ts.tpl',
		commandsInterfacePath,
		{
			RepositoryName: 'CommandsRepository',
		},
	);
}
