type Classification = 'GOOD' | 'OK' | 'FAIL';

export function classifyIsolation(externalPercent: number): Classification {
	if (externalPercent <= 0.2) return 'GOOD';
	if (externalPercent <= 0.5) return 'OK';
	return 'FAIL';
}

export function classifyDomainSize(domainPercent: number): Classification {
	if (domainPercent <= 0.3) return 'GOOD';
	if (domainPercent <= 0.5) return 'OK';
	return 'FAIL';
}

export function classifyFanOut(dependencies: number): Classification {
	if (dependencies <= 10) return 'GOOD';
	if (dependencies <= 20) return 'OK';
	return 'FAIL';
}

export function classifyFanIn(usedBy: number): Classification {
	if (usedBy <= 15) return 'GOOD';
	if (usedBy <= 30) return 'OK';
	return 'FAIL';
}

export function classifyChangeAmplification(
	avgFiles: number,
	maxFiles: number,
): Classification {
	if (avgFiles > 25 || maxFiles > 35) return 'FAIL';
	if (avgFiles > 18 || maxFiles > 25) return 'OK';
	return 'GOOD';
}

export function classifyDistanceFromMain(distance: number): Classification {
	if (distance <= 0.25) return 'GOOD';
	if (distance <= 0.5) return 'OK';
	return 'FAIL';
}

export function classifyTestsPercent(testPercent: number): Classification {
	if (testPercent >= 40) return 'GOOD';
	if (testPercent >= 20) return 'OK';
	return 'FAIL';
}
