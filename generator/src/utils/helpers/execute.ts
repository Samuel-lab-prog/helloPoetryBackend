import { Project, SourceFile } from 'ts-morph';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export type Primitive =
	| 'string'
	| 'number'
	| 'boolean'
	| 'string[]'
	| 'number[]';

export function resolvePrimitiveTs(type: Primitive): string {
	switch (type) {
		case 'string':
			return 'string';
		case 'number':
			return 'number';
		case 'boolean':
			return 'boolean';
		case 'string[]':
			return 'string[]';
		case 'number[]':
			return 'number[]';
		default:
			return 'any';
	}
}

export type ParamDefinition = {
	name: string;
	type: Primitive;
};

export function buildParamsType(params: ParamDefinition[]): string {
	if (params.length === 0) {
		return 'void';
	}

	const fields = params
		.map((p) => `${p.name}: ${resolvePrimitiveTs(p.type)}`)
		.join('; ');

	return `{ ${fields} }`;
}

export function buildReturnType(returns: readonly string[]): string {
	const hasNull = returns.includes('null');
	const models = returns.filter((r) => r !== 'null');

	const base = models.length === 1 ? models[0]! : models.join(' | ');

	return hasNull ? `${base} | null` : base;
}

export const project = new Project({
	tsConfigFilePath: 'tsconfig.json',
});

/**
 * Ensures that the directory for a given file path exists.
 * @param filePath Absolute or relative file path
 */
export function ensureDirectory(filePath: string): void {
	const dir = dirname(filePath);
	mkdirSync(dir, { recursive: true });
}

/**
 * Gets an existing source file or creates a new one if it does not exist.
 * The file is automatically added to the project.
 * @param project ts-morph Project instance
 * @param filePath Absolute or relative path to the source file
 * @returns SourceFile instance
 */
export function getOrCreateSourceFile(
	project: Project,
	filePath: string,
): SourceFile {
	const existing = project.getSourceFile(filePath);
	if (existing) return existing;

	if (existsSync(filePath)) {
		return project.addSourceFileAtPath(filePath);
	}

	ensureDirectory(filePath);
	return project.createSourceFile(filePath, '', { overwrite: false });
}

export function toPascalCase(str: string) {
	return str
		.split(/[-_]/g)
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join('');
}
