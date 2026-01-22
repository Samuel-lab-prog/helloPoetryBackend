import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { project } from '../../utils/helpers/execute';
import { FunctionDeclaration } from 'ts-morph';

type PolicyModel = {
	filePath: string; // caminho do Policies.ts
	name: string; // nome da função, ex: canAccessClientInfo
	parameters: Record<string, string>; // objeto de parâmetros { paramName: type }
	body: string; // corpo da função
};

export function ensurePolicyFile(policy: PolicyModel) {
	const dir = join(policy.filePath, '..');
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

	// Abre ou cria o arquivo
	let sourceFile = project.getSourceFile(policy.filePath);
	if (!sourceFile) {
		sourceFile = project.createSourceFile(policy.filePath, '', {
			overwrite: true,
		});
	}

	// Transform parameters object em string para TS
	const paramEntries = Object.entries(policy.parameters);
	const paramName = 'ctx';
	const paramType = `{ ${paramEntries.map(([k, t]) => `${k}: ${t}`).join('; ')} }`;

	// Verifica se a função já existe
	let fn: FunctionDeclaration | undefined = sourceFile.getFunction(policy.name);

	if (!fn) {
		fn = sourceFile.addFunction({
			name: policy.name,
			isExported: true,
			parameters: [{ name: paramName, type: paramType }],
			returnType: 'boolean',
			statements: policy.body.trim(),
		});
	} else {
		fn.setBodyText(policy.body.trim());
	}

	return fn;
}
