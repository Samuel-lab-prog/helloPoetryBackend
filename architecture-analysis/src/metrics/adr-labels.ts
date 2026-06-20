export const ADR = {
	domainStructure: 'ADR-001',
	fanOutLimits: 'ADR-002',
	orchestrationBoundaries: 'ADR-003',
	changeAmplification: 'ADR-004',
	domainIsolation: 'ADR-005',
	useCaseTests: 'ADR-006',
	domainTests: 'ADR-007',
	domainSize: 'ADR-008',
	mainSequenceDistance: 'ADR-009',
	noCrossDomainCalls: 'ADR-010',
	rootNamespaces: 'ADR-011',
	noRootSourceCode: 'ADR-012',
	directionalDependencies: 'ADR-013',
	mandatoryDomainFolders: 'ADR-014',
	circularDependencies: 'ADR-015',
	linting: 'ADR-016',
	architecturalMetrics: 'ADR-020',
} as const;

type Adr = (typeof ADR)[keyof typeof ADR];

export function withAdr(label: string, ...adrs: Adr[]): string {
	return `${label} (${adrs.join(', ')})`;
}
