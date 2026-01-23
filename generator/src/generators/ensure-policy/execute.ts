import { toPascalCase, type Primitive } from '../../utils/helpers/execute';
import { ensureTypeAlias } from '../../utils/ensure-type/execute';
import { ensureFunction } from '../../utils/ensure-function/execute';
import { join } from 'path';

type PolicyModel = {
	filePath: string;
	name: string;
	parameters: Record<string, Primitive>;
	body: string;
};

function ensurePolicyFile(p: PolicyModel) {
	const pascalName = toPascalCase(p.name);
	const paramsTypeName = `${pascalName}PolicyParams`;
	ensureTypeAlias(p.filePath, paramsTypeName, p.parameters, false);

	const fn = ensureFunction(p.filePath, p.name, {
		isExported: true,
		returnType: 'boolean',
		parameters: [{ name: 'ctx', type: paramsTypeName }],
	});
	const destructured = Object.keys(p.parameters).join(', ');

	fn.setBodyText(
		`
const { ${destructured} } = ctx;

${p.body}
`.trim(),
	);

	return fn;
}

export function generatePolicies(
	domainPath: string,
	kind: 'commands' | 'queries',
	policies?: {
		name: string;
		parameters: Record<string, Primitive>;
		body: string;
	}[],
) {
	if (!policies) return;
	const policiesDir = join(domainPath, 'use-cases', kind, 'policies');
	for (const policy of policies) {
		const policyFilePath = join(policiesDir, 'Policies.ts');
		ensurePolicyFile({
			filePath: policyFilePath,
			name: policy.name,
			parameters: policy.parameters,
			body: policy.body,
		});
	}
}
