export type ArchitectureSeverity = 'error' | 'warning';

export type ArchitectureFinding = {
	ruleId: string;
	severity: ArchitectureSeverity;
	finding: unknown;
};

export type LegacyArchitectureFinding = {
	ruleId: string;
	finding: unknown;
	reason: string;
};

export type ArchitectureFindingEvaluation = {
	blocking: ArchitectureFinding[];
	warnings: ArchitectureFinding[];
	legacy: Array<ArchitectureFinding & { reason: string }>;
	staleLegacy: LegacyArchitectureFinding[];
};

let findings: ArchitectureFinding[] = [];

export function resetArchitectureFindings(): void {
	findings = [];
}

export function recordArchitectureFindings(
	ruleId: string,
	entries: unknown[],
	severity: ArchitectureSeverity = 'error',
): void {
	if (!ruleId) throw new Error('Architecture findings require a rule id.');
	findings.push(...entries.map((finding) => ({ ruleId, severity, finding })));
}

export function getArchitectureFindings(): ArchitectureFinding[] {
	return findings.map((finding) => ({ ...finding }));
}

function stableSerialize(value: unknown): string {
	if (Array.isArray(value))
		return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`;
	if (value && typeof value === 'object') {
		const entries = Object.entries(value).sort(([left], [right]) =>
			left.localeCompare(right),
		);
		return `{${entries
			.map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
			.join(',')}}`;
	}
	return JSON.stringify(value) ?? 'undefined';
}

function findingKey(ruleId: string, finding: unknown): string {
	return `${ruleId}\0${stableSerialize(finding)}`;
}

export function evaluateArchitectureFindings(
	observedFindings: ArchitectureFinding[],
	legacyFindings: LegacyArchitectureFinding[],
): ArchitectureFindingEvaluation {
	const legacyByKey = new Map<string, LegacyArchitectureFinding>();
	for (const entry of legacyFindings) {
		if (!entry.ruleId || !entry.reason)
			throw new Error(
				'Legacy architecture findings require a rule id and reason.',
			);
		const key = findingKey(entry.ruleId, entry.finding);
		if (legacyByKey.has(key))
			throw new Error(`Duplicate legacy architecture finding: ${entry.ruleId}`);
		legacyByKey.set(key, entry);
	}

	const seenLegacy = new Set<string>();
	const blocking: ArchitectureFinding[] = [];
	const warnings: ArchitectureFinding[] = [];
	const legacy: Array<ArchitectureFinding & { reason: string }> = [];

	for (const entry of observedFindings) {
		if (entry.severity === 'warning') {
			warnings.push(entry);
			continue;
		}

		const key = findingKey(entry.ruleId, entry.finding);
		const exception = legacyByKey.get(key);
		if (exception) {
			seenLegacy.add(key);
			legacy.push({ ...entry, reason: exception.reason });
		} else {
			blocking.push(entry);
		}
	}

	const staleLegacy = legacyFindings.filter(
		(entry) => !seenLegacy.has(findingKey(entry.ruleId, entry.finding)),
	);

	return { blocking, warnings, legacy, staleLegacy };
}
