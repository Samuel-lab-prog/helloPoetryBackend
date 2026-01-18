import type { ClocData, CruiseResult } from '../types';
import { green, yellow, red, cyan, magenta } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';

type DomainKind = 'CORE' | 'UTILITY' | 'INFRA_SHARED';

function classifyDomainKind(domain: string): DomainKind {
	if (domain === 'utils') return 'UTILITY';
	if (domain === 'persistance') return 'INFRA_SHARED';
	return 'CORE';
}

export type DomainArchitectureMetric = {
	domain: string;
	kind: DomainKind;
	abstractness: number; // A
	instability: number; // I
	distance: number; // D
	ca: number;
	ce: number;
};

function extractDomainFromPath(path: string): string | null {
	const match = path.match(
		/(?:^|\/|\\)src[/\\](domains|generic-subdomains)[/\\]([^/\\]+)[/\\]/,
	);
	return match ? match[2]! : null;
}

function isAbstractFile(path: string, content?: string): boolean {
	return (
		path.includes('/ports/') ||
		path.includes('\\ports\\') ||
		(content?.includes('interface ') ?? false) ||
		(content?.includes('abstract class') ?? false)
	);
}

function calculateAbstraction(cloc: ClocData): Map<string, number> {
	const totalFiles = new Map<string, number>();
	const abstractFiles = new Map<string, number>();

	for (const [file, info] of Object.entries(cloc)) {
		if (!info.code) continue;

		const domain = extractDomainFromPath(file);
		if (!domain) continue;

		totalFiles.set(domain, (totalFiles.get(domain) ?? 0) + 1);

		if (isAbstractFile(file)) {
			abstractFiles.set(domain, (abstractFiles.get(domain) ?? 0) + 1);
		}
	}

	const abstraction = new Map<string, number>();
	for (const domain of totalFiles.keys()) {
		const abs = abstractFiles.get(domain) ?? 0;
		const total = totalFiles.get(domain)!;
		abstraction.set(domain, total === 0 ? 0 : abs / total);
	}

	return abstraction;
}

function calculateInstability(
	depcruise: CruiseResult,
): Map<string, { ca: number; ce: number; instability: number }> {
	const ca = new Map<string, number>();
	const ce = new Map<string, number>();

	for (const module of depcruise.modules) {
		const fromDomain = extractDomainFromPath(module.source);
		if (!fromDomain) continue;

		for (const dep of module.dependencies ?? []) {
			const toDomain = extractDomainFromPath(dep.resolved);
			if (!toDomain || toDomain === fromDomain) continue;

			ce.set(fromDomain, (ce.get(fromDomain) ?? 0) + 1);
			ca.set(toDomain, (ca.get(toDomain) ?? 0) + 1);
		}
	}

	const result = new Map<
		string,
		{ ca: number; ce: number; instability: number }
	>();

	const domains = new Set([...ca.keys(), ...ce.keys()]);
	for (const domain of domains) {
		const caVal = ca.get(domain) ?? 0;
		const ceVal = ce.get(domain) ?? 0;
		const total = caVal + ceVal;

		result.set(domain, {
			ca: caVal,
			ce: ceVal,
			instability: total === 0 ? 0 : ceVal / total,
		});
	}

	return result;
}

export function calculateAbstractionInstability(
	cloc: ClocData,
	depcruise: CruiseResult,
): DomainArchitectureMetric[] {
	const abstraction = calculateAbstraction(cloc);
	const instability = calculateInstability(depcruise);

	const domains = new Set([...abstraction.keys(), ...instability.keys()]);

	const metrics: DomainArchitectureMetric[] = [];

	for (const domain of domains) {
		const A = abstraction.get(domain) ?? 0;
		const inst = instability.get(domain) ?? {
			ca: 0,
			ce: 0,
			instability: 0,
		};

		const I = inst.instability;
		const D = Math.abs(A + I - 1);

		metrics.push({
			domain,
			kind: classifyDomainKind(domain),
			abstractness: A,
			instability: I,
			distance: D,
			ca: inst.ca,
			ce: inst.ce,
		});
	}

	return metrics;
}

function classifyDistance(
	distance: number,
	kind: DomainKind,
): {
	label: string;
	color: (text: string) => string;
} {
	if (kind === 'UTILITY') {
		return { label: 'UTILITY', color: cyan };
	}

	if (kind === 'INFRA_SHARED') {
		return { label: 'INFRA', color: magenta };
	}

	if (distance <= 0.3) return { label: 'GOOD', color: green };
	if (distance <= 0.6) return { label: 'OK', color: yellow };
	return { label: 'FAIL', color: red };
}

export function printInstabilityAbstraction(
	metrics: DomainArchitectureMetric[],
): void {
	const columns: TableColumn<DomainArchitectureMetric>[] = [
		{
			header: 'DOMAIN',
			width: 30,
			render: (m) => {
				const { color } = classifyDistance(m.distance, m.kind);
				return { text: m.domain, color };
			},
		},
		{
			header: 'A',
			width: 8,
			align: 'right',
			render: (m) => ({ text: m.abstractness.toFixed(2) }),
		},
		{
			header: 'I',
			width: 8,
			align: 'right',
			render: (m) => ({ text: m.instability.toFixed(2) }),
		},
		{
			header: 'D',
			width: 8,
			align: 'right',
			render: (m) => {
				const { color } = classifyDistance(m.distance, m.kind);
				return { text: m.distance.toFixed(2), color };
			},
		},
		{
			header: 'CA',
			width: 8,
			align: 'right',
			render: (m) => ({ text: String(m.ca) }),
		},
		{
			header: 'CE',
			width: 8,
			align: 'right',
			render: (m) => ({ text: String(m.ce) }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyDistance(m.distance, m.kind);
				return { text: label, color };
			},
		},
	];

	printTable(
		'Instability, Abstraction & Distance from the Main Sequence',
		columns,
		[...metrics].sort((a, b) => b.distance - a.distance),
	);
}
