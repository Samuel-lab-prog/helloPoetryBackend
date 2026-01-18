import type { CruiseResult } from '../types';
import { red, yellow, green } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';
import { classifyFanOut, classifyFanIn } from '../classify-results/index';

/**
 * Modules that should be completely ignored in dependency analysis
 */
const IGNORED_MODULES_PREFIXES = [
	'node_modules/',
	'internal/',
	'/index.ts',

	// technical/shared infrastructure
	'src/persistance/',
	'src/generic-subdomains/persistance/',
	'src/generic-subdomains/utils/prisma',
];

/**
 * Modules that are allowed to have very high fan-in
 * (shared infrastructure, cross-cutting concerns)
 */
const FAN_IN_EXCEPTIONS_PREFIXES = [
	'src/generic-subdomains/persistance/',
	'src/generic-subdomains/utils/',
	'bun:test',
];

function hasAnyPrefix(path: string, prefixes: string[]): boolean {
	return prefixes.some((prefix) => path.startsWith(prefix));
}

function isIgnored(modulePath: string): boolean {
	return hasAnyPrefix(modulePath, IGNORED_MODULES_PREFIXES);
}

function isFanInException(modulePath: string): boolean {
	return hasAnyPrefix(modulePath, FAN_IN_EXCEPTIONS_PREFIXES);
}

function isEntryPoint(modulePath: string): boolean {
	return modulePath.endsWith('/index.ts') || modulePath === 'src/index.ts';
}

export type FanMetric = {
	module: string;
	dependencies: number;
	loc?: number;
};

export function calculateFanOut(data: CruiseResult): FanMetric[] {
	return data.modules
		.filter((m) => !isEntryPoint(m.source))
		.filter((m) => !isIgnored(m.source))
		.map((m) => ({
			module: m.source,
			dependencies: m.dependencies.filter((d) => !isIgnored(d.resolved)).length,
		}));
}

export function calculateFanIn(data: CruiseResult): Map<string, number> {
	const fanIn = new Map<string, number>();

	data.modules
		.filter((m) => !isIgnored(m.source))
		.forEach((m) => {
			m.dependencies
				.filter((d) => !isIgnored(d.resolved))
				.forEach((d) => {
					// shared infra does not accumulate fan-in
					if (isFanInException(d.resolved)) return;

					fanIn.set(d.resolved, (fanIn.get(d.resolved) ?? 0) + 1);
				});
		});

	return fanIn;
}

function classifyFanInResult(deps: number): {
	label: string;
	color: (text: string) => string;
} {
	const label = classifyFanIn(deps);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

function classifyFanOutResult(deps: number): {
	label: string;
	color: (text: string) => string;
} {
	const label = classifyFanOut(deps);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}
export function printTopFanOut(fanOut: FanMetric[], limit = 15): void {
	const columns: TableColumn<FanMetric>[] = [
		{
			header: 'DEPS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { color } = classifyFanOutResult(m.dependencies);
				return { text: String(m.dependencies), color };
			},
		},
		{
			header: 'MODULE',
			width: 80,
			render: (m) => ({ text: m.module }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyFanOutResult(m.dependencies);
				return { text: label, color };
			},
		},
	];

	printTable(
		'Fan-out (outgoing dependencies)',
		columns,
		[...fanOut].sort((a, b) => b.dependencies - a.dependencies).slice(0, limit),
	);
}

type FanInMetric = {
	module: string;
	usedBy: number;
};

export function printTopFanIn(fanIn: Map<string, number>, limit = 15): void {
	const metrics: FanInMetric[] = [...fanIn.entries()]
		.map(([module, usedBy]) => ({ module, usedBy }))
		.sort((a, b) => b.usedBy - a.usedBy)
		.slice(0, limit);

	const columns: TableColumn<FanInMetric>[] = [
		{
			header: 'USED BY',
			width: 12,
			align: 'right',
			render: (m) => {
				const { color } = classifyFanInResult(m.usedBy);
				return { text: String(m.usedBy), color };
			},
		},
		{
			header: 'MODULE',
			width: 80,
			render: (m) => ({ text: m.module }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyFanInResult(m.usedBy);
				return { text: label, color };
			},
		},
	];

	printTable('Fan-in (incoming dependencies)', columns, metrics);
}

type HotspotMetric = Required<FanMetric>;

export function printHotspotModules(
	fanOutWithLoc: FanMetric[],
	minDeps = 15,
	minLoc = 100,
): void {
	const metrics: HotspotMetric[] = fanOutWithLoc.filter(
		(m): m is HotspotMetric =>
			m.dependencies > minDeps &&
			(m.loc ?? 0) > minLoc &&
			!isFanInException(m.module),
	);

	if (metrics.length === 0) {
		console.log(green('✔ No hotspot modules detected'));
		return;
	}

	const columns: TableColumn<HotspotMetric>[] = [
		{
			header: 'DEPS',
			width: 8,
			align: 'right',
			render: (m) => {
				const { color } = classifyFanOutResult(m.dependencies);
				return { text: String(m.dependencies), color };
			},
		},
		{
			header: 'LOC',
			width: 8,
			align: 'right',
			render: (m) => ({ text: String(m.loc) }),
		},
		{
			header: 'MODULE',
			width: 80,
			render: (m) => ({
				text: m.module,
				color: red,
			}),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: () => ({
				text: 'HOTSPOT',
				color: red,
			}),
		},
	];

	printTable('Hotspot modules', columns, metrics);
}
