import type { ClocResult } from '../Types';
import { printTable, type TableColumn } from '../PrintTable';

type CodeStats = {
	label: string;
	value: number;
};

type TestsResult = {
	nFiles: number;
	nTestFiles: number;
	testFilePercent: number;
};

function isTestFile(filePath: string): boolean {
	return filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts');
}

export function calculateTestsStats(cloc: ClocResult): TestsResult {
	const files = Object.keys(cloc).filter((k) => k !== 'SUM' && k !== 'header');
	const nFiles = files.length;
	const nTestFiles = files.filter(isTestFile).length;
	const testFilePercent = nFiles === 0 ? 0 : (nTestFiles / nFiles) * 100;

	return { nFiles, nTestFiles, testFilePercent };
}

export function calculateCodeTotals(cloc: ClocResult): CodeStats[] {
	const totalFiles = cloc.SUM.nFiles;
	const totalComments = cloc.SUM.comment;
	const totalBlank = cloc.SUM.blank;
	const totalCodeLines = cloc.SUM.code;
	const avgLinesPerFile = totalCodeLines / totalFiles;

	const testsStats = calculateTestsStats(cloc);

	return [
		{ label: 'FILES', value: totalFiles },
		{ label: 'LINES OF CODE', value: totalCodeLines },
		{ label: 'COMMENTS', value: totalComments },
		{ label: 'BLANK LINES', value: totalBlank },
		{ label: 'AVG LINES/FILE', value: Math.round(avgLinesPerFile) },
		{ label: 'TEST FILES', value: testsStats.nTestFiles },
		{ label: '% TEST FILES', value: Math.round(testsStats.testFilePercent) },
	];
}

export function printOverallStats(cloc: ClocResult): void {
	const metrics = calculateCodeTotals(cloc);

	const columns: TableColumn<CodeStats>[] = [
		{ header: 'LABEL', width: 30, render: (m) => ({ text: m.label }) },
		{
			header: 'VALUE',
			width: 20,
			align: 'right',
			render: (m) => ({ text: String(m.value) }),
		},
	];

	printTable('Codebase Totals & Tests', columns, metrics);
}
