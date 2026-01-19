import { join } from 'path';
import { generateFile } from '../utils/index.ts';

type Context = {
	domainName: string;
	isCommand?: boolean;
};
export async function generateHttpSkeleton(c: Context) {
	const baseHttPath = join('src', 'domains', c.domainName, 'adapters', 'http');
	const queriesServicesPath = join(baseHttPath, 'queries', 'Services.ts');
	const commandsServicesPath = join(baseHttPath, 'commands', 'Services.ts');
	const queriesRouterPath = join(baseHttPath, 'queries', 'QueriesRouter.ts');
	const commandsRouterPath = join(baseHttPath, 'commands', 'CommandsRouter.ts');

	await generateFile('http/Services.ts.tpl', queriesServicesPath, {
		InfraRepositoryName: 'queriesRepository',
		InfraRepositoryFolder: 'queries-repository',
		RouterServicesInterfaceName: 'QueriesServices',
		RouterServicesVariableName: 'queriesServices',
	});
	await generateFile('http/Services.ts.tpl', commandsServicesPath, {
		InfraRepositoryName: 'commandsRepository',
		InfraRepositoryFolder: 'commands-repository',
		RouterServicesInterfaceName: 'CommandsServices',
		RouterServicesVariableName: 'commandsServices',
	});
	await generateFile('http/Router.tpl', queriesRouterPath, {
		RouterServicesVariableName: 'queriesServices',
		RouterServicesInterfaceName: 'QueriesServices',
		RouterName: 'QueriesRouter',
		RoutePrefix: 'queries',
		RouterVariableName: 'queriesRouter',
	});
	await generateFile('http/Router.tpl', commandsRouterPath, {
		RouterServicesVariableName: 'commandsServices',
		RouterServicesInterfaceName: 'CommandsServices',
		RouterName: 'CommandsRouter',
		RoutePrefix: 'commands',
		RouterVariableName: 'commandsRouter',
	});
}
