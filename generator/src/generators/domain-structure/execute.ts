import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

const filePaths = [
	join('adapters/queries', 'Services.ts'),
	join('adapters/queries', 'QueriesRouter.ts'),
	join('adapters/commands', 'Services.ts'),
	join('adapters/commands', 'CommandsRouter.ts'),

	join('infra/queries-repository', 'Repository.ts'),
	join('infra/queries-repository', 'Repository.test.ts'),
	join('infra/commands-repository', 'Repository.ts'),
	join('infra/commands-repository', 'Repository.test.ts'),

	join('use-cases/queries/', 'Errors.ts'),
	join('use-cases/queries/', 'Index.ts'),
	join('use-cases/queries/', 'Models.ts'),
	join('use-cases/commands/', 'Errors.ts'),
	join('use-cases/commands/', 'Index.ts'),
	join('use-cases/commands/', 'Models.ts'),

	join('ports', 'QueriesRepository.ts'),
	join('ports', 'CommandsRepository.ts'),
	join('schemas/queries', 'Index.ts'),
	join('schemas/commands', 'Index.ts'),
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
