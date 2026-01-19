import { mkdir } from 'fs/promises';
import { join } from 'path';
import { green, red } from 'kleur/colors';
import { generateFile, toPascalCase } from './utils/index.ts';

const [, , domain, type, datamodel] = process.argv;

if (
	!domain ||
	!type ||
	!datamodel ||
	(type !== 'command' && type !== 'query')
) {
	console.error(red('Usage: gen:schema <domain> <command|query> <DataModel>'));
	process.exit(1);
}

const basePath = join('src', 'domains', domain, 'adapters', 'schemas');
await mkdir(basePath, { recursive: true });

const schemaName = toPascalCase(datamodel);

const context = {
	DataModel: datamodel,
	SchemaName: schemaName,
	isCommand: type === 'command',
};

await generateFile(
	'schema/schema.ts.tpl',
	join(basePath, `${schemaName}Schema.ts`),
	context,
);

console.log(
	green(`✔ Schema generated at ${join(basePath, `${schemaName}Schema.ts`)}`),
);
