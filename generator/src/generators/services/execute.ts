import { ensureNamedImport } from '../../utils/ensure-import/execute';

type SyncServicesParams = {
	domainPath: string;
	kind: 'command' | 'query';
	dataModels: { name: string; path: string }[];
	services: {
		useCaseFuncName: string;
		params: Record<string, string>[];
		returns: string[];
	}[];
};

export function syncServices(ctx: SyncServicesParams) {
	const { domainPath, kind: type, dataModels, services } = ctx;

	const kind = type === 'query' ? 'queries' : 'commands';
	const currentPath = `${domainPath}/adapters/http/${kind}/Services.ts`;
	console.log('Syncing services for', currentPath);

	// Repository Implementation Import
	ensureNamedImport(
		currentPath,
		`${kind}Repository`,
		`../../../infra/${kind}-repository/Repository`,
		true,
	);
	// Data Models Imports
	dataModels.forEach((model) => {
		ensureNamedImport(currentPath, model.name, model.path, true);
	});
	//Factory Imports
	services.forEach((service) => {
		ensureNamedImport(
			currentPath,
			service.useCaseFuncName + 'Factory',
			`../../../use-cases/${kind}/Index`,
		);
	});
}
