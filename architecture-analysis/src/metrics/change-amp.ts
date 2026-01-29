import { red, green, yellow } from 'kleur/colors';
import { execSync } from 'child_process';
import { printTable, type TableColumn } from '../ui/print-table';
import { classifyChangeAmplification } from '../classify-results';

type ChangeAmplificationMetric = {
	domain: string;
	commits: number;
	avgFilesChanged: number;
	maxFilesChanged: number;
};

function extractDomain(path: string): string | null {
	const match = path.match(/^src\/(domains|generic-subdomains)\/([^/]+)\//);
	return match ? match[2]! : null;
}

export function calculateChangeAmplification(
	commitLimit = 100,
): ChangeAmplificationMetric[] {
	const raw = execSync(
		`git log -n ${commitLimit} --name-only --pretty=format:`,
		{ encoding: 'utf-8' },
	);

	const commits = raw
		.split('\n\n')
		.map((block) =>
			block
				.split('\n')
				.map((l) => l.trim())
				.filter((f) => f.startsWith('src/') && f.endsWith('.ts')),
		)
		.filter((files) => files.length > 1);

	const domainStats = new Map<
		string,
		{ commits: number; totalFiles: number; maxFiles: number }
	>();

	commits.forEach((files) => {
		const domains = new Set(
			files.map(extractDomain).filter((d): d is string => Boolean(d)),
		);

		domains.forEach((domain) => {
			if (!domainStats.has(domain)) {
				domainStats.set(domain, {
					commits: 0,
					totalFiles: 0,
					maxFiles: 0,
				});
			}

			const filesInDomain = files.filter(
				(f) => extractDomain(f) === domain,
			).length;

			const stat = domainStats.get(domain)!;
			stat.commits++;
			stat.totalFiles += filesInDomain;
			stat.maxFiles = Math.max(stat.maxFiles, filesInDomain);
		});
	});

	return [...domainStats.entries()].map(([domain, s]) => ({
		domain,
		commits: s.commits,
		avgFilesChanged: s.totalFiles / (s.commits || 1),
		maxFilesChanged: s.maxFiles,
	}));
}

function classify(
	avg: number,
	maxFiles: number,
): {
	label: string;
	color: (text: string) => string;
} {
	const label = classifyChangeAmplification(avg, maxFiles);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}
const COMMITS_TO_ANALYZE = 100;
export function printChangeAmplification(): void {
	const metrics = calculateChangeAmplification(COMMITS_TO_ANALYZE);

	const columns: TableColumn<ChangeAmplificationMetric>[] = [
		{
			header: 'DOMAIN',
			width: 30,
			render: (m) => ({
				text: m.domain,
				color: classify(m.avgFilesChanged, m.maxFilesChanged).color,
			}),
		},
		{
			header: 'COMMITS',
			width: 14,
			align: 'right',
			render: (m) => ({ text: String(m.commits) }),
		},
		{
			header: 'AVG FILES',
			width: 16,
			align: 'right',
			render: (m) => {
				const { color } = classify(m.avgFilesChanged, m.maxFilesChanged);
				return {
					text: m.avgFilesChanged.toFixed(2),
					color,
				};
			},
		},
		{
			header: 'MAX FILES',
			width: 16,
			align: 'right',
			render: (m) => ({ text: String(m.maxFilesChanged) }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { label, color } = classify(m.avgFilesChanged, m.maxFilesChanged);
				return { text: label, color };
			},
		},
	];

	printTable(
		`Change Amplification Metrics (last ${COMMITS_TO_ANALYZE} commits)`,
		columns,
		[...metrics].sort((a, b) => b.avgFilesChanged - a.avgFilesChanged),
	);
}
