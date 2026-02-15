import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

const filePaths = [
	join('adapters', 'CommandsRouter.ts'),
	join('adapters', 'QueriesRouter.ts'),

	join('infra/queries-repository', 'Repository.ts'),
	join('infra/commands-repository', 'Repository.ts'),

	join('use-cases', 'Models.ts'),
	join('use-cases/queries/', 'Index.ts'),
	join('use-cases/commands/', 'Index.ts'),
	join('use-cases/test-helpers/', 'Index.ts'),
	join('use-cases/test-helpers/', 'Constants.ts'),
	join('use-cases/test-helpers/', 'Givens.ts'),
	join('use-cases/test-helpers/', 'Helper.ts'),

	join('Composition.ts'),

	join('ports', 'Queries.ts'),
	join('ports', 'Commands.ts'),
	join('ports/schemas', 'Index.ts'),
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
