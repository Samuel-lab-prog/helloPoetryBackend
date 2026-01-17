import { red, yellow, green } from 'kleur/colors';
import { printTable, type TableColumn } from '../ui/print-table';

export type FanMetric = {
	module: string;
	dependencies: number;
	loc?: number;
};

function classifyFan(deps: number): {
	label: string;
	color: (text: string) => string;
} {
	if (deps <= 5) return { label: 'LOW', color: green };
	if (deps <= 15) return { label: 'MEDIUM', color: yellow };
	return { label: 'HIGH', color: red };
}

export function printTopFanOut(fanOut: FanMetric[], limit = 15): void {
	const columns: TableColumn<FanMetric>[] = [
		{
			header: 'DEPS',
			width: 10,
			align: 'right',
			render: (m) => {
				const { color } = classifyFan(m.dependencies);
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
				const { label, color } = classifyFan(m.dependencies);
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
				const { color } = classifyFan(m.usedBy);
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
				const { label, color } = classifyFan(m.usedBy);
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
			m.dependencies > minDeps && (m.loc ?? 0) > minLoc,
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
				const { color } = classifyFan(m.dependencies);
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
