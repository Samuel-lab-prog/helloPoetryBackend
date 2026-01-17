import { divider, padLeft, padRight, section } from '../ui/console-format';

export type FanMetric = {
	module: string;
	dependencies: number;
	loc?: number;
};

/* ----------------------------------
 * Fan-out report
 * ---------------------------------- */

export function printTopFanOut(fanOut: FanMetric[], limit = 15): void {
	section('Top modules by number of dependencies');

	const COL_DEPS = 10;
	const COL_PATH = 80;

	console.log(padLeft('DEPS', COL_DEPS) + '  ' + padRight('MODULE', COL_PATH));

	console.log(divider('·'));

	[...fanOut]
		.sort((a, b) => b.dependencies - a.dependencies)
		.slice(0, limit)
		.forEach((m) => {
			console.log(
				padLeft(String(m.dependencies), COL_DEPS) +
					'  ' +
					padRight(m.module, COL_PATH),
			);
		});
}

/* ----------------------------------
 * Fan-in report
 * ---------------------------------- */

export function printTopFanIn(fanIn: Map<string, number>, limit = 15): void {
	section('Top modules by number of dependents');

	const COL_COUNT = 12;
	const COL_PATH = 78;

	console.log(
		padLeft('USED BY', COL_COUNT) + '  ' + padRight('MODULE', COL_PATH),
	);

	console.log(divider('·'));

	[...fanIn.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.forEach(([module, count]) => {
			console.log(
				padLeft(String(count), COL_COUNT) + '  ' + padRight(module, COL_PATH),
			);
		});
}

/* ----------------------------------
 * Hotspot report
 * ---------------------------------- */

export function printHotspotModules(
	fanOutWithLoc: FanMetric[],
	minDeps = 15,
	minLoc = 300,
): void {
	section(`Hotspot modules (> ${minDeps} deps & > ${minLoc} loc)`);

	const COL_DEPS = 8;
	const COL_LOC = 8;
	const COL_PATH = 80;

	console.log(
		padLeft('DEPS', COL_DEPS) +
			'  ' +
			padLeft('LOC', COL_LOC) +
			'  ' +
			padRight('MODULE', COL_PATH),
	);

	console.log(divider('·'));

	fanOutWithLoc
		.filter((m) => m.dependencies > minDeps && (m.loc ?? 0) > minLoc)
		.forEach((m) => {
			console.log(
				padLeft(String(m.dependencies), COL_DEPS) +
					'  ' +
					padLeft(String(m.loc), COL_LOC) +
					'  ' +
					padRight(m.module, COL_PATH),
			);
		});
}
