import { red, green, yellow } from 'kleur/colors';
import type { DepcruiseResult } from '../../Types';
import { printTable, type TableColumn } from '../../PrintTable';
import { extractDomainFromPath, isGenericSubdomain } from '../../Utils';

type Violation = {
	from: string;
	to: string;
	fromDomain: string;
	toDomain: string;
};

const ALLOWED_CROSS_DOMAIN_REGEX = /\/public\//;

function checkDomainNamespaceIntegrity(
	cruiseResult: DepcruiseResult,
): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const from = module.source;
		const fromDomain = extractDomainFromPath(from);
		if (!fromDomain) continue;

		for (const dep of module.dependencies ?? []) {
			const to = dep.resolved;
			if (!to) continue;
			if (isGenericSubdomain(to)) continue;
			if (!to.startsWith('src/domains/')) continue;

			const toDomain = extractDomainFromPath(to);
			if (!toDomain) continue;
			if (toDomain === fromDomain) continue;
			if (ALLOWED_CROSS_DOMAIN_REGEX.test(to)) continue;

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

export function printNoCrossDomainCalls(cruiseResult: DepcruiseResult): void {
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
	];

	printTable(
		`Cross-domain violations (${violations.length})`,
		columns,
		violations,
	);
}
