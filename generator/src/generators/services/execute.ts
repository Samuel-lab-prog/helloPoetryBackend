import { ensureExportedObject } from '../../utils/ensure-expo-object/execute';
import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureInterface } from '../../utils/ensure-interface/execute';

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
	// Router Services Interface
	const ifaceName = `${kind.charAt(0).toUpperCase() + kind.slice(1)}RouterServices`;
	const ifaceImplName =
		ifaceName.charAt(0).toLocaleLowerCase() + ifaceName.slice(1);
	const iface = ensureInterface(currentPath, ifaceName, true);
	// Ruoter Services Implementation
	ensureExportedObject({
		filePath: currentPath,
		objectName: ifaceImplName,
		type: ifaceName,
		content: '{ }',
	});

	services.forEach((s) => {
		if (iface.getMethod(s.useCaseFuncName)) {
			return;
		}

		const params = s.params
			.map((p) =>
				Object.entries(p)

					.map(([key, type]) => `${key}: ${type}`)
					.join(', '),
			)
			.join('; ');

		const returns = s.returns.length > 1 ? s.returns.join(' | ') : s.returns[0];

		iface.addMethod({
			name: s.useCaseFuncName,
			parameters: [{ name: 'params', type: `{ ${params} }` }],
			returnType: `Promise<${returns}>`,
		});
	});
}
