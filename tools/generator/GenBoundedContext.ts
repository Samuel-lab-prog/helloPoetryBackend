import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { green, red } from 'kleur/colors';
import { generateRepositorySkeleton } from './write-base-files/GenerateRepoInterfaceSkeleton.ts';
import { generateHttpSkeleton } from './write-base-files/GenerateHttpSkeleton.ts';
import {
	generateRepoSkeleton,
	generateRepositoryTest,
} from './write-base-files/GenerateInfraSkeleton.ts';
import { generateErrorsSkeleton } from './write-base-files/GenerateErrorsSkeleton.ts';

const [, , maybeDomain] = process.argv;

if (!maybeDomain) {
	console.error(red('Usage: gen-bc <domain>'));
	process.exit(1);
}

const domainName: string = maybeDomain;
const basePath = join('src', 'domains', domainName);

const folders = [
	'adapters/http/queries',
	'adapters/http/commands',
	'adapters/schemas/fields',
	'adapters/schemas/parameters',
	'infra/queries-repository',
	'infra/commands-repository',
	'use-cases/queries/read-models',
	'use-cases/queries/policies',
	'use-cases/queries/dtos',
	'use-cases/commands/commands-models',
	'use-cases/commands/policies',
	'ports',
];

for (const folder of folders) {
	const fullPath = join(basePath, folder);
	await mkdir(fullPath, { recursive: true });
}

const files = [
	{
		path: join(basePath, 'adapters/http/queries', 'Services.ts'),
	},
	{
		path: join(basePath, 'adapters/http/queries', 'QueriesRouter.ts'),
	},
	{
		path: join(basePath, 'adapters/http/commands', 'Services.ts'),
	},
	{
		path: join(basePath, 'adapters/http/commands', 'CommandsRouter.ts'),
	},
	{
		path: join(basePath, 'adapters/schemas/fields', 'NameSchemas.ts'),
	},
	{
		path: join(basePath, 'adapters/schemas/fields', 'Enums.ts'),
	},
	{
		path: join(basePath, 'adapters/schemas', 'Index.ts'),
	},
	{
		path: join(basePath, 'adapters/schemas/parameters', 'IdSchema.ts'),
		content: ` const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'infra/queries-repository', 'SelectModels.ts'),
	},
	{
		path: join(basePath, 'infra/queries-repository', 'Helpers.ts'),
	},
	{
		path: join(basePath, 'infra/queries-repository', 'Repository.ts'),
	},
	{
		path: join(basePath, 'infra/queries-repository', 'Repository.test.ts'),
	},
	{
		path: join(basePath, 'infra/commands-repository', 'Repository.test.ts'),
	},
	{
		path: join(basePath, 'infra/commands-repository', 'Helpers.ts'),
	},
	{
		path: join(basePath, 'infra/commands-repository', 'Repository.ts'),
	},
	{
		path: join(basePath, 'use-cases/queries/', 'Errors.ts'),
	},
	{
		path: join(basePath, 'use-cases/queries/', 'Index.ts'),
	},
	{
		path: join(basePath, 'use-cases/queries/read-models', 'Index.ts'),
	},
	{
		path: join(basePath, 'use-cases/queries/policies', 'Policies.ts'),
	},
	{
		path: join(basePath, 'use-cases/queries/dtos', 'Dtos.ts'),
	},
	{
		path: join(basePath, 'use-cases/commands/', 'Errors.ts'),
	},
	{
		path: join(basePath, 'use-cases/commands/', 'Index.ts'),
	},
	{
		path: join(basePath, 'use-cases/commands/commands-models', 'Index.ts'),
	},
	{
		path: join(basePath, 'use-cases/commands/policies', 'Policies.ts'),
	},
	{
		path: join(basePath, 'ports', 'QueriesRepository.ts'),
	},
	{
		path: join(basePath, 'ports', 'CommandsRepository.ts'),
	},
];

for (const file of files) {
	await writeFile(file.path, '');
}

await generateRepositorySkeleton(domainName);
await generateHttpSkeleton({
	domainName,
});
await generateRepoSkeleton({
	domainName,
});
await generateRepositoryTest({
	domainName,
});
await generateErrorsSkeleton(domainName);

console.log(
	green(
		`✔ Bounded context "${domainName}" with base files created successfully!`,
	),
);
