import type { DepcruiseData } from '../types';

export type DomainIsolationMetric = {
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
	depcruise: DepcruiseData,
): DomainIsolationMetric[] {
	const acc = new Map<string, { internal: number; external: number }>();

	depcruise.modules.forEach((m) => {
		const fromDomain = extractDomain(m.source);
		if (!fromDomain) return;

		if (!acc.has(fromDomain)) {
			acc.set(fromDomain, { internal: 0, external: 0 });
		}

		m.dependencies.forEach((d) => {
			const toDomain = extractDomain(d.resolved);
			if (!toDomain) return;

			if (toDomain === fromDomain) {
				acc.get(fromDomain)!.internal++;
			} else {
				acc.get(fromDomain)!.external++;
			}
		});
	});

	return [...acc.entries()].map(([domain, v]) => {
		const total = v.internal + v.external || 1;
		return {
			domain,
			internalDeps: v.internal,
			externalDeps: v.external,
			externalPercent: v.external / total,
		};
	});
}
