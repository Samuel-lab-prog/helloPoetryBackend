import { existsSync } from 'fs';
import { green } from 'kleur/colors';

import { generateBoundedContext } from './BoundedContextFactory.ts';
import useCases from '../UseCases.config.ts';
import type {
	UseCaseDefinition,
	DataModelsDefinition,
} from './DefineUseCases.ts';

type UseCasesConfigFile<DM extends DataModelsDefinition> = {
	domain: string;
	useCases: UseCaseDefinition<DM>[];
};
/**
 * Generates the use case files in the specified domain folder. If the domain folder does not exist, it creates the bounded context structure first.
 * @param config The use cases configuration object.
 * @param basePath The base path where the domain folder is located.
 */
async function generate<DM extends DataModelsDefinition>(
	config: UseCasesConfigFile<DM>,
	basePath: string,
): Promise<void> {
	const domainPath = `${basePath}/${config.domain}`;

	if (!existsSync(domainPath)) {
		await generateBoundedContext(config.domain, basePath);
		console.log(
			green(
				`Created Bounded Context folder structure for domain: ${config.domain}`,
			),
		);
	}

	// Here you would add the logic to generate files for each use case
}

await generate(useCases, './src/domains');
console.log(green('Use Cases generated successfully!'));
