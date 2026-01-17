import type { DepcruiseData } from '../types';

type Layer = 'adapters' | 'use-cases' | 'domain';

const LAYER_ORDER: Record<Layer, number> = {
	adapters: 0,
	'use-cases': 1,
	domain: 2,
};

function extractLayer(path: string): Layer | null {
	if (path.includes('/adapters/')) return 'adapters';
	if (path.includes('/use-cases/')) return 'use-cases';
	if (path.includes('/domain/') || path.includes('/entities/')) return 'domain';
	return null;
}

type DirectionViolation = {
	from: string;
	to: string;
	fromLayer: Layer;
	toLayer: Layer;
};

export function detectDirectionalViolations(
	depcruise: DepcruiseData,
): DirectionViolation[] {
	const violations: DirectionViolation[] = [];

	depcruise.modules.forEach((m) => {
		const fromLayer = extractLayer(m.source);
		if (!fromLayer) return;

		m.dependencies.forEach((d) => {
			const toLayer = extractLayer(d.resolved);
			if (!toLayer) return;

			if (LAYER_ORDER[fromLayer] > LAYER_ORDER[toLayer]) {
				violations.push({
					from: m.source,
					to: d.resolved,
					fromLayer,
					toLayer,
				});
			}
		});
	});

	return violations;
}
