import type { ClocData, DomainMetric, DomainAggregate } from '../types';
import { classifyDomainSize } from '../classify-results/index';

export function calculateDomainAggregates(
	cloc: ClocData,
): Map<string, DomainAggregate> {
	const domainData = new Map<string, DomainAggregate>();

	Object.entries(cloc).forEach(([file, info]) => {
		// ignore cloc summary and files without code
		if (file === 'SUM' || !info?.code) return;

		const match = file.match(
			/(?:^|\/|\\)src[/\\](domains|generic-subdomains)[/\\]([^/\\]+)[/\\]/,
		);

		if (!match) return;

		const domainName = match[2]!;

		const current = domainData.get(domainName) ?? { loc: 0, files: 0 };

		domainData.set(domainName, {
			loc: current.loc + info.code,
			files: current.files + 1,
		});
	});

	return domainData;
}

export function calculateDomainStatistics(
	domainData: Map<string, DomainAggregate>,
	totalLoc: number,
): DomainMetric[] {
	const locValues = [...domainData.values()].map((d) => d.loc);

	const mean = locValues.reduce((a, b) => a + b, 0) / locValues.length;

	const variance =
		locValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / locValues.length;

	const stdDev = Math.sqrt(variance) || 1;

	return [...domainData.entries()].map(([domain, data]) => ({
		domain,
		loc: data.loc,
		files: data.files,
		percent: data.loc / totalLoc,
		zScore: (data.loc - mean) / stdDev,
	}));
}

import { red, yellow, green } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';

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
			header: 'FILES',
			width: 12,
			align: 'right',
			render: (m) => ({ text: String(m.files) }),
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
