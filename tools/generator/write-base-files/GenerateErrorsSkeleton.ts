import { join } from 'path';
import { generateFile } from '../utils/TemplateUtils';

export async function generateErrorsSkeleton(domainName: string) {
	const commandsPath = join(
		'src',
		'domains',
		domainName,
		'use-cases',
		'commands',
		'Errors.ts',
	);
	const queriesPath = join(
		'src',
		'domains',
		domainName,
		'use-cases',
		'queries',
		'Errors.ts',
	);

	await generateFile('errors/Errors.ts.tpl', queriesPath, {});
	await generateFile('errors/Errors.ts.tpl', commandsPath, {});
}
