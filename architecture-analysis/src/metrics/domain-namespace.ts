/* eslint-disable @typescript-eslint/no-explicit-any */
import { red, yellow, bold } from 'kleur/colors';

type Violation = {
	from: string;
	to: string;
	fromDomain: string;
	toDomain: string;
};

const DOMAIN_PATH_REGEX = /^src\/domains\/([^/]+)\//;

function extractDomain(path: string): string | null {
	const match = path.match(DOMAIN_PATH_REGEX);
	return match?.[1] ?? null;
}

function isGenericSubdomain(path: string): boolean {
	return path.startsWith('src/generic-subdomains/');
}

function checkDomainNamespaceIntegrity(cruiseResult: any): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const from = module.source;
		const fromDomain = extractDomain(from);

		if (!fromDomain) continue;

		for (const dep of module.dependencies ?? []) {
			const to = dep.resolved;

			if (!to) continue;
			if (isGenericSubdomain(to)) continue;
			if (!to.startsWith('src/domains/')) continue;

			const toDomain = extractDomain(to);

			if (!toDomain) continue;
			if (toDomain === fromDomain) continue;

			violations.push({
				from,
				to,
				fromDomain,
				toDomain,
			});
		}
	}

	return violations;
}

export function printDomainNamespaceIntegrity(cruiseResult: any) {
	const violations = checkDomainNamespaceIntegrity(cruiseResult);

	console.log('\n' + bold('DOMAIN NAMESPACE INTEGRITY'));
	console.log('────────────────────────────────────────────────────────');

	if (violations.length === 0) {
		console.log('✔ No cross-domain violations found');
		return;
	}

	console.log(
		red(`✖ ${violations.length} cross-domain violation(s) detected\n`),
	);

	for (const v of violations) {
		console.log(yellow(`• ${v.fromDomain}`) + ' → ' + red(v.toDomain));
		console.log(`  from: ${v.from}`);
		console.log(`  to:   ${v.to}\n`);
	}
}
