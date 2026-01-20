import { writeFileSafe, readFileSafe } from '../../utils/FilesUtils';
import { join } from 'path';

export interface DomainErrorDefinition {
	name: string;
	type: string;
	message: string;
}

/**
 * Synchronizes a domain errors file.
 * - Creates the file if it doesn't exist
 * - Adds new errors if they are missing
 * - Deduplicates existing errors
 *
 * @param domain Domain name
 * @param errors List of domain errors to sync
 */
export async function syncDomainErrors(
	domain: string,
	isCommand: boolean,
	errors: DomainErrorDefinition[],
) {
	const errorsFilePath = join(
		'src',
		'domains',
		domain,
		'use-cases',
		isCommand ? 'commands' : 'queries',
		'Errors.ts',
	);
	let content = await readFileSafe(
		errorsFilePath,
		"import { DomainError } from '@DomainError';\n\n",
	);

	for (const error of errors) {
		const classRegex = new RegExp(
			`export\\s+class\\s+${error.name}\\s+extends\\s+DomainError`,
			'm',
		);

		if (!classRegex.test(content)) {
			const errorContent = `export class ${error.name} extends DomainError {
  constructor() {
    super('${error.type}', '${error.message}');
  }
}\n\n`;
			content += errorContent;
		}
	}

	await writeFileSafe(errorsFilePath, content.trim() + '\n');
}
