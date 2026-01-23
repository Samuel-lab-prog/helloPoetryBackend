import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

const filePaths = [
	join('adapters/http/queries', 'Services.ts'),
	join('adapters/http/queries', 'QueriesRouter.ts'),
	join('adapters/http/commands', 'Services.ts'),
	join('adapters/http/commands', 'CommandsRouter.ts'),
	join('adapters/schemas/fields', 'NameSchemas.ts'),
	join('adapters/schemas/fields', 'Enums.ts'),
	join('adapters/schemas/parameters', 'IdSchema.ts'),
	join('adapters/schemas', 'Index.ts'),

	join('infra/queries-repository', 'Repository.ts'),
	join('infra/queries-repository', 'Repository.test.ts'),
	join('infra/queries-repository', 'SelectModels.ts'),
	join('infra/queries-repository', 'Helpers.ts'),
	join('infra/commands-repository', 'Repository.ts'),
	join('infra/commands-repository', 'Repository.test.ts'),
	join('infra/commands-repository', 'SelectModels.ts'),
	join('infra/commands-repository', 'Helpers.ts'),

	join('use-cases/queries/', 'Errors.ts'),
	join('use-cases/queries/', 'Index.ts'),
	join('use-cases/queries/models', 'Index.ts'),
	join('use-cases/queries/policies', 'Policies.ts'),
	join('use-cases/queries/dtos', 'Dtos.ts'),
	join('use-cases/commands/', 'Index.ts'),
	join('use-cases/commands/', 'Errors.ts'),
	join('use-cases/commands/models', 'Index.ts'),
	join('use-cases/commands/policies', 'Policies.ts'),
	join('use-cases/commands/dtos', 'Dtos.ts'),

	join('ports', 'QueriesRepository.ts'),
	join('ports', 'CommandsRepository.ts'),
];

export async function generateBoundedContext(
	name: string,
	basePath: string,
): Promise<void> {
	const tasks = filePaths.map(async (filePath) => {
		const fullPath = join(basePath, name, filePath);
		await mkdir(dirname(fullPath), { recursive: true });
		await writeFile(fullPath, '');
	});

	await Promise.all(tasks);
}

export async function ensureDomainStructure(domain: string, basePath: string) {
	const domainPath = `${basePath}/${domain}`;
	if (!existsSync(domainPath)) {
		await generateBoundedContext(domain, basePath);
		console.log(
			`Created Bounded Context folder structure for domain: ${domain}`,
		);
	}
}
