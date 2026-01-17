import type { DepcruiseData, FanMetric } from '../types';

export function calculateFanOut(data: DepcruiseData): FanMetric[] {
	return data.modules.map((m) => ({
		module: m.source,
		dependencies: m.dependencies.length,
	}));
}

export function calculateFanIn(data: DepcruiseData): Map<string, number> {
	const fanIn = new Map<string, number>();

	data.modules.forEach((m) => {
		m.dependencies.forEach((d) => {
			fanIn.set(d.resolved, (fanIn.get(d.resolved) ?? 0) + 1);
		});
	});

	return fanIn;
}
