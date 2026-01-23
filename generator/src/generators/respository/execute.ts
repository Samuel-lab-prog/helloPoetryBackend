import { ensureFunction } from '../../utils/ensure-function/execute';
import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureExportedObject } from '../../utils/ensure-expo-object/execute';
import {
	buildReturnType,
	type ParamDefinition,
} from '../../utils/helpers/execute';

type SyncRepositoryParams = {
	domainPath: string;
	kind: 'command' | 'query';
	dataModels: { name: string; path: string }[];
	helpers: { name: string; body: string }[];
	methods: {
		name: string;
		params: ParamDefinition[];
		returns: string[];
		body: string;
		selectModel?: { name: string; body: string };
	}[];
};

// eslint-disable-next-line max-lines-per-function
export function syncRepository(ctx: SyncRepositoryParams) {
	const { domainPath, kind, dataModels, helpers, methods } = ctx;

	const repoFolder = `${domainPath}/infra/${kind === 'query' ? 'queries' : 'commands'}-repository`;
	const currentPath = `${repoFolder}/Repository.ts`;
	const selectModelsPath = `${repoFolder}/SelectModels.ts`;

	// Imports principais
	ensureNamedImport(currentPath, 'prisma', '@PrismaClient');
	ensureNamedImport(
		currentPath,
		'withPrismaErrorHandling',
		'@PrismaErrorHandler',
	);
	ensureNamedImport(
		currentPath,
		`${kind === 'query' ? 'Queries' : 'Commands'}Repository`,
		`../../ports/${kind === 'query' ? 'Queries' : 'Commands'}Repository`,
		true,
	);

	// Imports dos modelos
	dataModels.forEach((model) => {
		ensureNamedImport(currentPath, model.name, model.path, true);
	});

	// SelectModels
	methods.forEach((method) => {
		if (method.selectModel?.name) {
			ensureNamedImport(
				currentPath,
				method.selectModel.name,
				'./SelectModels.ts',
			);
			ensureExportedObject({
				type: 'Record<string, boolean>',
				objectName: method.selectModel.name,
				filePath: selectModelsPath,
				content: `{ ${method.selectModel.body} }`,
			});
		}
	});

	// Helpers
	helpers.forEach((helper) => {
		ensureNamedImport(currentPath, helper.name, './Helpers.ts');
	});

	// Funções do repository
	methods.forEach((method) => {
		const paramsType =
			method.params.length === 0
				? []
				: [
						{
							name: 'params',
							type: `{ ${method.params.map((p) => `${p.name}: ${p.type}`).join(', ')} }`,
						},
					];

		const fn = ensureFunction(currentPath, method.name, {
			parameters: paramsType,
			returnType: `Promise<${buildReturnType(method.returns)}>`,
			isExported: true,
		});

		const destructuredParams =
			method.params.length === 0
				? ''
				: `const { ${method.params.map((p) => p.name).join(', ')} } = params;`;

		fn.setBodyText(`
      ${destructuredParams}
      return withPrismaErrorHandling(async () => {
        ${method.body}
      });
    `);
	});

	// Export do repository
	ensureExportedObject({
		type: `${kind === 'query' ? 'Queries' : 'Commands'}Repository`,
		objectName: `${kind === 'query' ? 'queries' : 'commands'}Repository`,
		filePath: currentPath,
		content: `{ ${methods.map((m) => m.name).join(', ')} }`,
	});
}
