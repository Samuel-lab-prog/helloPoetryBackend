import type { DepcruiseResult } from '../types';
import { red, yellow, green } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';
import { classifyFanOut, classifyFanIn } from '../classify-results';

const IGNORED_MODULES = [
	'node_modules/',
	'internal/',
	'/index.ts',
	'/Index.ts',
	'src/persistance/',
	'src/generic-subdomains/persistance/',
	'src/generic-subdomains/utils/prisma',
	'src/shared-kernel/Schemas',
	'src/generic-subdomains/authentication',
];

const FAN_IN_EXCEPTIONS = [
	'src/generic-subdomains/persistance/',
	'src/generic-subdomains/utils/',
	'bun:test',
];

function startsWithAny(path: string, prefixes: string[]): boolean {
	return prefixes.some(prefix => path.startsWith(prefix));
}

function isIgnored(modulePath: string): boolean {
	return startsWithAny(modulePath, IGNORED_MODULES);
}

function isFanInException(modulePath: string): boolean {
	return startsWithAny(modulePath, FAN_IN_EXCEPTIONS);
}

function isEntryPoint(modulePath: string): boolean {
	return modulePath.endsWith('/index.ts') || modulePath.endsWith('/Index.ts') || modulePath === 'src/index.ts';
}

export type FanMetric = {
	module: string;
	dependencies: number;
	loc?: number;
};

export function calculateFanOut(depcruise: DepcruiseResult): FanMetric[] {
	return depcruise.modules
		.filter(m => !isEntryPoint(m.source) && !isIgnored(m.source))
		.map(m => ({
			module: m.source,
			dependencies: m.dependencies.filter(d => !isIgnored(d.resolved)).length,
		}));
}

export function calculateFanIn(depcruise: DepcruiseResult): Map<string, number> {
	const fanIn = new Map<string, number>();

	depcruise.modules
		.filter(m => !isIgnored(m.source))
		.forEach(m => {
			m.dependencies
				.filter(d => !isIgnored(d.resolved))
				.forEach(d => {
					if (isFanInException(d.resolved)) return;
					fanIn.set(d.resolved, (fanIn.get(d.resolved) ?? 0) + 1);
				});
		});

	return fanIn;
}

function classifyFanInMetric(count: number) {
	const label = classifyFanIn(count);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

function classifyFanOutMetric(count: number) {
	const label = classifyFanOut(count);
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

const FAN_OUT_LIMIT = 10;
export function printTopFanOut(fanOut: FanMetric[], limit = FAN_OUT_LIMIT): void {
	const columns: TableColumn<FanMetric>[] = [
		{
			header: 'DEPS',
			width: 10,
			align: 'right',
			render: m => ({ text: String(m.dependencies), color: classifyFanOutMetric(m.dependencies).color }),
		},
		{
			header: 'MODULE',
			width: 90,
			render: m => ({ text: m.module }),
		},
		{
			header: 'STATUS',
			width: 14,
			align: 'right',
			render: m => {
				const { label, color } = classifyFanOutMetric(m.dependencies);
				return { text: label, color };
			},
		},
	];

	const sorted = [...fanOut].sort((a, b) => b.dependencies - a.dependencies).slice(0, limit);
	printTable(`Top ${limit} Fan-out (outgoing dependencies)`, columns, sorted);
}

type FanInMetric = {
	module: string;
	usedBy: number;
};

const FAN_IN_LIMIT = 10;
export function printTopFanIn(fanIn: Map<string, number>, limit = FAN_IN_LIMIT): void {
	const metrics: FanInMetric[] = [...fanIn.entries()]
		.map(([module, usedBy]) => ({ module, usedBy }))
		.sort((a, b) => b.usedBy - a.usedBy)
		.slice(0, limit);

	const columns: TableColumn<FanInMetric>[] = [
		{
			header: 'USED BY',
			width: 10,
			align: 'right',
			render: m => ({ text: String(m.usedBy), color: classifyFanInMetric(m.usedBy).color }),
		},
		{
			header: 'MODULE',
			width: 90,
			render: m => ({ text: m.module }),
		},
		{
			header: 'STATUS',
			width: 14,
			align: 'right',
			render: m => {
				const { label, color } = classifyFanInMetric(m.usedBy);
				return { text: label, color };
			},
		},
	];

	printTable(`Top ${limit} Fan-in (incoming dependencies)`, columns, metrics);
}

type HotspotMetric = Required<FanMetric>;

export function printHotspotModules(
	fanOutWithLoc: FanMetric[],
	minDeps = 15,
	minLoc = 100,
): void {
	const hotspots: HotspotMetric[] = fanOutWithLoc.filter(
		(m): m is HotspotMetric =>
			m.dependencies > minDeps && (m.loc ?? 0) > minLoc && !isFanInException(m.module),
	);

	if (!hotspots.length) {
		console.log(green('✔ No hotspot modules detected'));
		return;
	}

	const columns: TableColumn<HotspotMetric>[] = [
		{
			header: 'DEPS',
			width: 8,
			align: 'right',
			render: m => ({ text: String(m.dependencies), color: classifyFanOutMetric(m.dependencies).color }),
		},
		{
			header: 'LOC',
			width: 8,
			align: 'right',
			render: m => ({ text: String(m.loc) }),
		},
		{
			header: 'MODULE',
			width: 90,
			render: m => ({ text: m.module, color: red }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: () => ({ text: 'HOTSPOT', color: red }),
		},
	];

	printTable('Hotspot modules', columns, hotspots);
}
