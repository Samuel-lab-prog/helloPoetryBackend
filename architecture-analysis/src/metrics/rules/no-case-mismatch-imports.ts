import fs from 'node:fs';
import path from 'node:path';
import { red, yellow, green } from 'kleur/colors';
import type { ClocResult } from '../../Types';
import { printTable, type TableColumn } from '../../PrintTable';

type Violation = {
	file: string;
	importPath: string;
	resolvedPath: string;
};

const IMPORT_REGEX =
	/\b(?:import|export)\s+(?:[^'"]*from\s*)?['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_REGEX = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

function normalize(filePath: string): string {
	return filePath.replace(/\\/g, '/');
}

function buildFileMap(cloc: ClocResult): Map<string, string> {
	const map = new Map<string, string>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const normalized = normalize(rawPath);
		map.set(normalized.toLowerCase(), normalized);
	}

	return map;
}

function getImportPaths(content: string): string[] {
	const results: string[] = [];
	let match: RegExpExecArray | null;

	IMPORT_REGEX.lastIndex = 0;
	while ((match = IMPORT_REGEX.exec(content))) {
		results.push(match[1]!);
	}

	DYNAMIC_IMPORT_REGEX.lastIndex = 0;
	while ((match = DYNAMIC_IMPORT_REGEX.exec(content))) {
		results.push(match[1]!);
	}

	return results;
}

function resolveImport(
	fromFile: string,
	importPath: string,
	fileMap: Map<string, string>,
): { expected: string; actual: string } | null {
	if (!importPath.startsWith('.')) return null;

	const fromDir = path.posix.dirname(fromFile);
	const base = path.posix.normalize(path.posix.join(fromDir, importPath));
	const hasExtension = path.posix.extname(base).length > 0;

	const candidates = hasExtension
		? [base]
		: [
				`${base}.ts`,
				`${base}.tsx`,
				`${base}.js`,
				`${base}.jsx`,
				path.posix.join(base, 'index.ts'),
				path.posix.join(base, 'index.tsx'),
				path.posix.join(base, 'index.js'),
				path.posix.join(base, 'index.jsx'),
			];

	for (const candidate of candidates) {
		const actual = fileMap.get(candidate.toLowerCase());
		if (actual) return { expected: candidate, actual };
	}

	return null;
}

function findCaseMismatchImports(cloc: ClocResult): Violation[] {
	const fileMap = buildFileMap(cloc);
	const violations: Violation[] = [];

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const filePath = normalize(rawPath);
		// eslint-disable-next-line no-useless-assignment
		let content = '';

		try {
			content = fs.readFileSync(filePath, 'utf8');
		} catch {
			continue;
		}

		const imports = getImportPaths(content);

		for (const importPath of imports) {
			const resolved = resolveImport(filePath, importPath, fileMap);
			if (!resolved) continue;

			if (resolved.expected !== resolved.actual) {
				violations.push({
					file: filePath,
					importPath,
					resolvedPath: resolved.actual,
				});
			}
		}
	}

	return violations;
}

export function printNoCaseMismatchImports(cloc: ClocResult): void {
	const violations = findCaseMismatchImports(cloc);

	if (violations.length === 0) {
		console.log(green('All imports match filesystem casing'));
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'FILE',
			width: 55,
			render: (v) => ({
				text: v.file,
				color: red,
			}),
		},
		{
			header: 'IMPORT',
			width: 50,
			render: (v) => ({
				text: v.importPath,
				color: yellow,
			}),
		},
		{
			header: 'RESOLVED',
			width: 60,
			render: (v) => ({
				text: v.resolvedPath,
			}),
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: () => ({
				text: 'VIOLATION',
				color: red,
			}),
		},
	];

	printTable(
		`Case-sensitive import violations (${violations.length})`,
		columns,
		violations,
	);
}
