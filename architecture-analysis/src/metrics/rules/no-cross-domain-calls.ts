import { red, green, yellow } from 'kleur/colors';
import type { CruiseResult } from '../../types';
import { printTable, type TableColumn } from '../../ui/print-table';

type Violation = {
	from: string;
	to: string;
	fromDomain: string;
	toDomain: string;
};

const DOMAIN_PATH_REGEX = /^src\/domains\/([^/]+)\//;

function extractDomain(path: string): string | null {
	const match = path.match(DOMAIN_PATH_REGEX);
	return match?.[1] ?? null;
}

function isGenericSubdomain(path: string): boolean {
	return path.startsWith('src/generic-subdomains/');
}

function checkDomainNamespaceIntegrity(
	cruiseResult: CruiseResult,
): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const from = module.source;
		const fromDomain = extractDomain(from);
		if (!fromDomain) continue;

		for (const dep of module.dependencies ?? []) {
			const to = dep.resolved;
			if (!to) continue;
			if (isGenericSubdomain(to)) continue;
			if (!to.startsWith('src/domains/')) continue;

			const toDomain = extractDomain(to);
			if (!toDomain) continue;
			if (toDomain === fromDomain) continue;

			violations.push({
				from,
				to,
				fromDomain,
				toDomain,
			});
		}
	}

	return violations;
}

export function printNoCrossDomainCalls(cruiseResult: CruiseResult): void {
	const violations = checkDomainNamespaceIntegrity(cruiseResult);

	if (violations.length === 0) {
		console.log(green('✔ No cross-domain violations found'));
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'FROM DOMAIN',
			width: 20,
			render: (v) => ({
				text: v.fromDomain,
				color: yellow,
			}),
		},
		{
			header: 'TO DOMAIN',
			width: 20,
			render: (v) => ({
				text: v.toDomain,
				color: red,
			}),
		},
		{
			header: 'FROM MODULE',
			width: 60,
			render: (v) => ({
				text: v.from,
			}),
		},
		{
			header: 'TO MODULE',
			width: 60,
			render: (v) => ({
				text: v.to,
			}),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: () => ({
				text: 'VIOLATION',
				color: red,
			}),
		},
	];

	printTable(
		`Cross-domain violations (${violations.length})`,
		columns,
		violations,
	);
}
