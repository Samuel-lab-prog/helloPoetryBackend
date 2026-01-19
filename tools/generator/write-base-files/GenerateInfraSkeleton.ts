import { join } from 'path';
import { generateFile } from '../utils/index.ts';

type Context = {
	domainName: string;
};

export async function generateRepoSkeleton(c: Context) {
	const basePath = join('src', 'domains', c.domainName, 'infra');

	const queriesRepoInterfaceName = 'QueriesRepository';
	const queriesrepoVariableName = 'queriesRepository';
	const commandsRepoInterfaceName = 'CommandsRepository';
	const commandsrepoVariableName = 'commandsRepository';
	const queriesRepoPath = join(basePath, 'queries-repository', 'Repository.ts');
	const commandsRepoPath = join(
		basePath,
		'commands-repository',
		'Repository.ts',
	);

	await generateFile('infra/Repository.ts.tpl', queriesRepoPath, {
		RepositoryInterfaceName: queriesRepoInterfaceName,
		RepositoryVariableName: queriesrepoVariableName,
	});
	await generateFile('infra/Repository.ts.tpl', commandsRepoPath, {
		RepositoryInterfaceName: commandsRepoInterfaceName,
		RepositoryVariableName: commandsrepoVariableName,
	});
}

type TestContext = {
	domainName: string;
};

export async function generateRepositoryTest(c: TestContext) {
	const basePath = join('src', 'domains', c.domainName, 'infra');
	const queriesRepoTestPath = join(
		basePath,
		'queries-repository',
		'Repository.test.ts',
	);
	const commandsRepoTestPath = join(
		basePath,
		'commands-repository',
		'Repository.test.ts',
	);

	await generateFile('infra/RepositoryTest.ts.tpl', queriesRepoTestPath, {
		RepositoryVariableName: 'queriesRepository',
	});
	await generateFile('infra/RepositoryTest.ts.tpl', commandsRepoTestPath, {
		RepositoryVariableName: 'commandsRepository',
	});
}
