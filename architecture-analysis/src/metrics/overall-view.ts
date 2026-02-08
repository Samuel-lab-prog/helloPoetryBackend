import type { ClocResult } from '../Types';
import { printTable, type TableColumn } from '../PrintTable';
import { classifyTestsPercent } from '../Classify';
import { green, red, yellow } from 'kleur/colors';
import { extractDomainFromPath, isTestFile } from '../Utils';

type DomainCodeStats = {
	domain: string;
	totalFiles: number;
	totalLOC: number;
	totalComments: number;
	totalBlanks: number;
	testLOC: number;
	testPercent: number;
};

export function calculateDomainCodeStats(cloc: ClocResult): DomainCodeStats[] {
	const domainMap = new Map<
		string,
		{
			files: number;
			code: number;
			comments: number;
			blanks: number;
			testLOC: number;
		}
	>();

	for (const [file, info] of Object.entries(cloc)) {
		if (file === 'SUM' || file === 'header') continue;

		if (!('code' in info)) continue;

		const domain = extractDomainFromPath(file);
		if (!domain) continue;

		const stats = domainMap.get(domain) ?? {
			files: 0,
			code: 0,
			comments: 0,
			blanks: 0,
			testLOC: 0,
		};

		stats.files++;
		stats.code += info.code;
		stats.comments += info.comment;
		stats.blanks += info.blank;
		if (isTestFile(file)) stats.testLOC += info.code;

		domainMap.set(domain, stats);
	}

	return [...domainMap.entries()].map(([domain, stats]) => ({
		domain,
		totalFiles: stats.files,
		totalLOC: stats.code,
		totalComments: stats.comments,
		totalBlanks: stats.blanks,
		testLOC: stats.testLOC,
		testPercent: stats.code === 0 ? 0 : (stats.testLOC / stats.code) * 100,
	}));
}

function classifyTestCoverage(testsPercent: number) {
	const label = classifyTestsPercent(testsPercent);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

export function printDomainCodeStats(cloc: ClocResult): void {
	const metrics = calculateDomainCodeStats(cloc);

	const columns: TableColumn<DomainCodeStats>[] = [
		{
			header: 'DOMAIN',
			width: 32,
			render: (m) => ({
				text: m.domain,
				color: classifyTestCoverage(m.testPercent).color,
			}),
		},
		{
			header: 'FILES',
			width: 6,
			align: 'right',
			render: (m) => ({ text: String(m.totalFiles) }),
		},
		{
			header: 'LOC',
			width: 8,
			align: 'right',
			render: (m) => ({ text: String(m.totalLOC) }),
		},
		{
			header: 'COMMENTS',
			width: 10,
			align: 'right',
			render: (m) => ({ text: String(m.totalComments) }),
		},
		{
			header: 'BLANKS',
			width: 10,
			align: 'right',
			render: (m) => ({ text: String(m.totalBlanks) }),
		},
		{
			header: 'TEST LOC',
			width: 8,
			align: 'right',
			render: (m) => ({ text: String(m.testLOC) }),
		},
		{
			header: '% TEST LINES',
			width: 13,
			align: 'right',
			render: (m) => {
				return {
					text: m.testPercent.toFixed(2) + '%',
					color: classifyTestCoverage(m.testPercent).color,
				};
			},
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyTestCoverage(m.testPercent);
				return { text: label, color };
			},
		},
	];

	printTable('Domain Code Metrics (by lines of test code)', columns, metrics);
}
