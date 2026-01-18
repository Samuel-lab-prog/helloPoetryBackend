import type { ClocData } from '../types';
import { classifyDomainSize } from '../classify-results/index';

export function calculateDomainLoc(cloc: ClocData): Map<string, number> {
	const domainLoc = new Map<string, number>();

	Object.entries(cloc).forEach(([file, info]) => {
		if (!info.code) return;

		const match = file.match(
			/(?:^|\/|\\)src[/\\](domains|generic-subdomains)[/\\]([^/\\]+)[/\\]/,
		);

		if (!match) return;

		const domainName = match[2]!;

		domainLoc.set(domainName, (domainLoc.get(domainName) ?? 0) + info.code);
	});

	return domainLoc;
}

export function calculateDomainStatistics(
	domainLoc: Map<string, number>,
	totalLoc: number,
): DomainMetric[] {
	const values = [...domainLoc.values()];

	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const variance =
		values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

	const stdDev = Math.sqrt(variance) || 1;

	return [...domainLoc.entries()].map(([domain, loc]) => ({
		domain,
		loc,
		percent: loc / totalLoc,
		zScore: (loc - mean) / stdDev,
	}));
}

import { red, yellow, green } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';

export type DomainMetric = {
	domain: string;
	loc: number;
	percent: number;
	zScore: number;
};

function classifySizeResult(percent: number): {
	label: string;
	color: (text: string) => string;
} {
	const abs = Math.abs(percent);
	const label = classifyDomainSize(abs);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

export function printDomainStatistics(metrics: DomainMetric[]): void {
	const columns: TableColumn<DomainMetric>[] = [
		{
			header: 'DOMAIN',
			width: 30,
			render: (m) => ({
				text: m.domain,
				color: classifySizeResult(m.percent).color,
			}),
		},
		{
			header: 'LOC',
			width: 12,
			align: 'right',
			render: (m) => ({ text: String(m.loc) }),
		},
		{
			header: '% TOTAL',
			width: 12,
			align: 'right',
			render: (m) => ({
				text: `${(m.percent * 100).toFixed(1)}%`,
			}),
		},
		{
			header: 'Z-SCORE',
			width: 12,
			align: 'right',
			render: (m) => {
				const { color } = classifySizeResult(m.percent);
				return {
					text: m.zScore.toFixed(2),
					color,
				};
			},
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { label, color } = classifySizeResult(m.percent);
				return { text: label, color };
			},
		},
	];

	printTable(
		'Domain Size Metrics',
		columns,
		[...metrics].sort((a, b) => b.loc - a.loc),
	);
}
