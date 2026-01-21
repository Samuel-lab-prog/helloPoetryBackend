import { existsSync } from 'fs';
import { green } from 'kleur/colors';

import { generateBoundedContext } from './BoundedContextFactory.ts';
import useCases from '../UseCases.config.ts';
import type {
	UseCaseDefinition,
	DataModelsDefinition,
} from './DefineUseCases.ts';

type UseCasesConfigModule<DM extends DataModelsDefinition> = {
	domain: string;
	useCases: UseCaseDefinition<DM>[];
};

async function generateUseCases<DM extends DataModelsDefinition>(
	module: UseCasesConfigModule<DM>,
	basePath: string,
): Promise<void> {
	const domainPath = `${basePath}/${module.domain}`;

	if (!existsSync(domainPath)) {
		await generateBoundedContext(module.domain, basePath);
		console.log(
			green(
				`Created Bounded Context folder structure for domain: ${module.domain}`,
			),
		);
	}

	// Here you would add the logic to generate files for each use case
}

await generateUseCases(useCases, './src/domains');
console.log(green('Use Cases generated successfully!'));
