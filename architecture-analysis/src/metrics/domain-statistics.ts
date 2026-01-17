import type { ClocData, DomainMetric } from '../types';

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
