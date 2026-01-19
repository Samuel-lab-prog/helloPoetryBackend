import { join } from 'path';
import { green } from 'kleur/colors';
import { generateFile } from '../utils/index.ts';

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
	console.log(green(`✔ Created interface: ${queriesInterfacePath}`));
	console.log(green(`✔ Created interface: ${commandsInterfacePath}`));
}
