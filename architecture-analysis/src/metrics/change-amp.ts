/* eslint-disable max-nested-callbacks */
import { execSync } from 'child_process';

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
