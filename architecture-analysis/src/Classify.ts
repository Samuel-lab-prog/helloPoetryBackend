export function classifyIsolation(
	externalPercent: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (externalPercent <= 0.2) return 'GOOD';
	if (externalPercent <= 0.5) return 'OK';
	return 'FAIL';
}

export function classifyDomainSize(
	domainPercent: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (domainPercent <= 0.3) return 'GOOD';
	if (domainPercent <= 0.5) return 'OK';
	return 'FAIL';
}

export function classifyFanOut(dependencies: number): 'GOOD' | 'OK' | 'FAIL' {
	if (dependencies <= 10) return 'GOOD';
	if (dependencies <= 20) return 'OK';
	return 'FAIL';
}

export function classifyFanIn(usedBy: number): 'GOOD' | 'OK' | 'FAIL' {
	if (usedBy <= 15) return 'GOOD';
	if (usedBy <= 30) return 'OK';
	return 'FAIL';
}

export function classifyChangeAmplification(
	avgFiles: number,
	maxFiles: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (avgFiles > 25 || maxFiles > 35) return 'FAIL';
	if (avgFiles > 18 || maxFiles > 25) return 'OK';
	return 'GOOD';
}

export function classifyDistanceFromMain(
	distance: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (distance <= 0.25) return 'GOOD';
	if (distance <= 0.5) return 'OK';
	return 'FAIL';
}

export function classifyTestsPercent(
	testPercent: number,
): 'GOOD' | 'OK' | 'FAIL' {
	if (testPercent >= 40) return 'GOOD';
	if (testPercent >= 20) return 'OK';
	return 'FAIL';
}
