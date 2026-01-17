import { red, yellow, green } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';

export type DomainMetric = {
	domain: string;
	loc: number;
	percent: number;
	zScore: number;
};

function classify(zScore: number): {
	label: string;
	color: (text: string) => string;
} {
	const abs = Math.abs(zScore);

	if (abs <= 1) return { label: 'OK', color: green };
	if (abs <= 2) return { label: 'WARN', color: yellow };
	return { label: 'OUTLIER', color: red };
}

export function printDomainStatistics(metrics: DomainMetric[]): void {
	const columns: TableColumn<DomainMetric>[] = [
		{
			header: 'DOMAIN',
			width: 30,
			render: (m) => ({
				text: m.domain,
				color: classify(m.zScore).color,
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
				const { color } = classify(m.zScore);
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
				const { label, color } = classify(m.zScore);
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
