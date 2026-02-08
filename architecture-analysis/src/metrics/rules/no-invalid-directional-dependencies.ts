import { red, green } from 'kleur/colors';
import type { DepcruiseResult } from '../../types';
import { printTable, type TableColumn } from '../../ui/print-table';

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
	cruiseResult: DepcruiseResult,
): DirectionViolation[] {
	const violations: DirectionViolation[] = [];

	cruiseResult.modules.forEach((m) => {
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

export function printNoInvalidDirectionalDependencies(
	cruiseResult: DepcruiseResult,
): void {
	const violations = detectDirectionalViolations(cruiseResult);

	if (violations.length === 0) {
		console.log(green('✔ No invalid directional dependencies found'));
		return;
	}

	const columns: TableColumn<DirectionViolation>[] = [
		{
			header: 'FROM LAYER',
			width: 16,
			render: (v) => ({ text: v.fromLayer, color: red }),
		},
		{
			header: 'TO LAYER',
			width: 16,
			render: (v) => ({ text: v.toLayer }),
		},
		{
			header: 'FROM MODULE',
			width: 60,
			render: (v) => ({ text: v.from }),
		},
		{
			header: 'TO MODULE',
			width: 60,
			render: (v) => ({ text: v.to }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: () => ({ text: 'VIOLATION', color: red }),
		},
	];

	printTable(
		`Directional violations (${violations.length})`,
		columns,
		violations,
	);
}
