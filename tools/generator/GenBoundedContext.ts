import { mkdir } from 'fs/promises';
import { join } from 'path';
import { green, red } from 'kleur/colors';

const [, , domain] = process.argv;

if (!domain) {
	console.error(red('Usage: gen-bc <domain>'));
	process.exit(1);
}

const basePath = join('src', 'domains', domain);

const folders = [
	'adapters/http/queries',
	'adapters/http/commands',
	'adapters/schemas/fields',
	'infra/queries-repository',
	'infra/commands-repository',
	'use-cases/queries/read-models',
	'use-cases/queries/policies',
	'use-cases/commands/command-models',
	'use-cases/commands/policies',
	'ports',
];

for (const folder of folders) {
	const fullPath = join(basePath, folder);
	await mkdir(fullPath, { recursive: true });
	console.log(green(`✔ Created folder: ${fullPath}`));
}

console.log(green(`✔ Bounded context "${domain}" created successfully!`));
