export function classifyIsolation(
	externalPercent: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (externalPercent <= 0.15) return 'GOOD';
	if (externalPercent <= 0.3) return 'OK';
	return 'FAIL';
}

export function classifyDomainSize(
	domainPercent: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (domainPercent <= 0.45) return 'GOOD';
	if (domainPercent <= 0.6) return 'OK';
	return 'FAIL';
}

export function classifyFanOut(dependencies: number): 'GOOD' | 'OK' | 'FAIL' {
	if (dependencies <= 7) return 'GOOD';
	if (dependencies <= 12) return 'OK';
	return 'FAIL';
}

export function classifyFanIn(usedBy: number): 'GOOD' | 'OK' | 'FAIL' {
	if (usedBy <= 10) return 'GOOD';
	if (usedBy <= 20) return 'OK';
	return 'FAIL';
}

export function classifyChangeAmplification(
	avgFiles: number,
	maxFiles: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (avgFiles > 10 || maxFiles > 30) return 'FAIL';
	if (avgFiles > 5 || maxFiles > 20) return 'OK';
	return 'GOOD';
}

export function classifyDistanceFromMain(
	distance: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (distance <= 0.3) return 'GOOD';
	if (distance <= 0.6) return 'OK';
	return 'FAIL';
}
