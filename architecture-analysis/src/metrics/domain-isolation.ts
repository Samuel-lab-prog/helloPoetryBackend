import { red, green, yellow } from 'kleur/colors';
import { printTable, type TableColumn } from '../PrintTable';
import type { DepcruiseResult } from '../Types';
import { classifyIsolation } from '../Classify';

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

	cruiseResult.modules.forEach((module) => {
		const fromDomain = extractDomain(module.source);
		if (!fromDomain) return;

		if (!acc.has(fromDomain)) {
			acc.set(fromDomain, { internal: 0, external: 0 });
		}

		module.dependencies.forEach((dep) => {
			const toDomain = extractDomain(dep.resolved);
			if (!toDomain) return;

			const record = acc.get(fromDomain)!;
			if (toDomain === fromDomain) record.internal++;
			else record.external++;
		});
	});

	return [...acc.entries()].map(([domain, counts]) => {
		const total = counts.internal + counts.external || 1;
		return {
			domain,
			internalDeps: counts.internal,
			externalDeps: counts.external,
			externalPercent: counts.external / total,
		};
	});
}

function classifyMetric(externalPercent: number) {
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
			width: 32,
			render: (m) => ({
				text: m.domain,
				color: classifyMetric(m.externalPercent).color,
			}),
		},
		{
			header: 'INT DEPS',
			width: 20,
			align: 'right',
			render: (m) => ({ text: String(m.internalDeps) }),
		},
		{
			header: 'EXT DEPS',
			width: 20,
			align: 'right',
			render: (m) => ({ text: String(m.externalDeps) }),
		},
		{
			header: '% EXT',
			width: 20,
			align: 'right',
			render: (m) => {
				const { color } = classifyMetric(m.externalPercent);
				return { text: `${(m.externalPercent * 100).toFixed(1)}%`, color };
			},
		},
		{
			header: 'STATUS',
			width: 15,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyMetric(m.externalPercent);
				return { text: label, color };
			},
		},
	];

	printTable(
		'Domain Isolation Metrics',
		columns,
		metrics.sort((a, b) => b.externalPercent - a.externalPercent),
	);
}
