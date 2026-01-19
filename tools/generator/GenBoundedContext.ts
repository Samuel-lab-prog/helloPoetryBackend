import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { green, red } from 'kleur/colors';

const [, , maybeDomain] = process.argv;

if (!maybeDomain) {
	console.error(red('Usage: gen-bc <domain>'));
	process.exit(1);
}

const domain: string = maybeDomain;
const basePath = join('src', 'domains', domain);

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
	'use-cases/commands/command-models',
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
		content: `TODO: Define your HTTP queries services here`,
	},
	{
		path: join(basePath, 'adapters/http/queries', 'QueriesRouter.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'adapters/http/commands', 'Services.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'adapters/http/commands', 'CommandsRouter.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'adapters/schemas/fields', 'NameSchemas.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'adapters/schemas/fields', 'Enums.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'adapters/schemas/parameters', 'IdSchema.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'infra/queries-repository', 'SelectModels.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'infra/queries-repository', 'Helpers.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'infra/queries-repository', 'Repository.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'infra/queries-repository', 'Repository.test.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'infra/commands-repository', 'Repository.test.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'infra/commands-repository', 'Repository.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'use-cases/queries/', 'Errors.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'use-cases/queries/read-models', 'FullEntity.ts'),
		content: `export type FullEntity = { name: string };`,
	},
	{
		path: join(basePath, 'use-cases/queries/policies', 'Policies.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'use-cases/queries/dtos', 'Dtos.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'use-cases/commands/', 'Errors.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'use-cases/commands/command-models', 'Create.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'use-cases/commands/command-models', 'Update.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'use-cases/commands/policies', 'Policies.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'ports', 'QueriesRepository.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
	{
		path: join(basePath, 'ports', 'CommandsRepository.ts'),
		content: `export const firstLineOfCode = 'Hello, World!';`,
	},
];

for (const file of files) {
	await writeFile(file.path, file.content);
}

console.log(
	green(`✔ Bounded context "${domain}" with base files created successfully!`),
);
