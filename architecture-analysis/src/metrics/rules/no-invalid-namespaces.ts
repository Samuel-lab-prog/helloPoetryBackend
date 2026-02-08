import { red, green, yellow } from 'kleur/colors';
import type { DepcruiseResult } from '../../types';
import { printTable, type TableColumn } from '../../ui/print-table';

type Violation = {
	module: string;
	rootNamespace: string;
};

const ALLOWED_ROOT_NAMESPACES = new Set([
	'domains',
	'generic-subdomains',
	'shared-kernel',
	'tests',
]);

function extractRootNamespace(path: string): string | null {
	const match = path.match(/^src\/([^/]+)\//);
	return match?.[1] ?? null;
}

function checkRootNamespaceRestriction(
	cruiseResult: DepcruiseResult,
): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const source = module.source;
		if (!source.startsWith('src/')) continue;

		const rootNamespace = extractRootNamespace(source);
		if (!rootNamespace) continue;

		if (!ALLOWED_ROOT_NAMESPACES.has(rootNamespace)) {
			violations.push({
				module: source,
				rootNamespace,
			});
		}
	}

	return violations;
}

export function printNoInvalidRootNamespaces(
	cruiseResult: DepcruiseResult,
): void {
	const violations = checkRootNamespaceRestriction(cruiseResult);

	if (violations.length === 0) {
		console.log(green('✔ All root namespaces are valid'));
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'ROOT',
			width: 24,
			render: (v) => ({ text: v.rootNamespace, color: yellow }),
		},
		{
			header: 'MODULE',
			width: 80,
			render: (v) => ({ text: v.module }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: () => ({ text: 'VIOLATION', color: red }),
		},
	];

	printTable(
		`Invalid root namespaces (${violations.length})`,
		columns,
		violations,
	);
}
