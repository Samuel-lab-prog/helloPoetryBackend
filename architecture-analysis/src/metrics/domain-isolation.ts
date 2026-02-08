import { red, green, yellow } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';
import type { DepcruiseResult } from '../types';
import { classifyIsolation } from '../classify-results/index';

type DomainIsolationMetric = {
	domain: string;
	internalDeps: number;
	externalDeps: number;
	externalPercent: number;
};

function extractDomain(path: string): string | null {
	const match = path.match(/^src\/(domains|generic-subdomains)\/([^/]+)\//);
	return match ? match[2]! : null;
}

export function calculateDomainIsolation(
	cruiseResult: DepcruiseResult,
): DomainIsolationMetric[] {
	const acc = new Map<string, { internal: number; external: number }>();

	cruiseResult.modules.forEach((m) => {
		const fromDomain = extractDomain(m.source);
		if (!fromDomain) return;

		if (!acc.has(fromDomain)) {
			acc.set(fromDomain, { internal: 0, external: 0 });
		}

		m.dependencies.forEach((d) => {
			const toDomain = extractDomain(d.resolved);
			if (!toDomain) return;

			if (toDomain === fromDomain) {
				acc.get(fromDomain)!.internal++;
			} else {
				acc.get(fromDomain)!.external++;
			}
		});
	});

	return [...acc.entries()].map(([domain, v]) => {
		const total = v.internal + v.external || 1;
		return {
			domain,
			internalDeps: v.internal,
			externalDeps: v.external,
			externalPercent: v.external / total,
		};
	});
}

function classifyIsolationResult(externalPercent: number): {
	label: string;
	color: (text: string) => string;
} {
	const label = classifyIsolation(externalPercent);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

export function printDomainIsolation(cruiseResult: DepcruiseResult): void {
	const metrics = calculateDomainIsolation(cruiseResult);

	const columns: TableColumn<DomainIsolationMetric>[] = [
		{
			header: 'DOMAIN',
			width: 30,
			render: (m) => ({
				text: m.domain,
				color: classifyIsolationResult(m.externalPercent).color,
			}),
		},
		{
			header: 'INT DEPS',
			width: 12,
			align: 'right',
			render: (m) => ({ text: String(m.internalDeps) }),
		},
		{
			header: 'EXT DEPS',
			width: 12,
			align: 'right',
			render: (m) => ({ text: String(m.externalDeps) }),
		},
		{
			header: '% EXT',
			width: 10,
			align: 'right',
			render: (m) => {
				const { color } = classifyIsolationResult(m.externalPercent);
				return {
					text: `${(m.externalPercent * 100).toFixed(1)}%`,
					color,
				};
			},
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyIsolationResult(m.externalPercent);
				return { text: label, color };
			},
		},
	];

	printTable(
		`Domain Isolation Metrics`,
		columns,
		[...metrics].sort((a, b) => b.externalPercent - a.externalPercent),
	);
}
