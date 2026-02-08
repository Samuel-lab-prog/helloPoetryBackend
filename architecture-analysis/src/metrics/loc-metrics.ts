import type { ClocData, FanMetric } from '../Types';

export function buildLocMap(cloc: ClocData): Map<string, number> {
	const map = new Map<string, number>();

	Object.entries(cloc).forEach(([file, info]) => {
		if (info.code) map.set(file, info.code);
	});

	return map;
}

export function attachLocToFanOut(
	fanOut: FanMetric[],
	locMap: Map<string, number>,
): FanMetric[] {
	return fanOut.map((m) => ({
		...m,
		loc: locMap.get(m.module) ?? 0,
	}));
}
