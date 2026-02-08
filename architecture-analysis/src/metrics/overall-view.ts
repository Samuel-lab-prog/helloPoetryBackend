import type { ClocResult } from '../Types';
import { printTable, type TableColumn } from '../PrintTable';

type CodeStats = {
	label: string;
	value: number;
};

function calculateCodeTotals(cloc: ClocResult): CodeStats[] {
	const totalFiles = cloc.SUM.nFiles;
	const totalComments = cloc.SUM.comment;
	const totalBlank = cloc.SUM.blank;
	const totalCodeLines = cloc.SUM.code;
	const avgLinesPerFile = totalCodeLines / totalFiles;

	return [
		{ label: 'FILES', value: totalFiles },
		{ label: 'LINES OF CODE', value: totalCodeLines },
		{ label: 'COMMENTS', value: totalComments },
		{ label: 'BLANK LINES', value: totalBlank },
		{ label: 'AVG LINES/FILE', value: Math.round(avgLinesPerFile) },
	];
}

export function printOverallStats(cloc: ClocResult): void {
	const metrics = calculateCodeTotals(cloc);

	const columns: TableColumn<CodeStats>[] = [
		{ header: 'LABEL', width: 58, render: (m) => ({ text: m.label }) },
		{
			header: 'VALUE',
			width: 59,
			align: 'right',
			render: (m) => ({ text: String(m.value) }),
		},
	];

	printTable('Codebase Totals', columns, metrics);
}
