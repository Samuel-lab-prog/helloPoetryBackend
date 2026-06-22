import { green, red } from 'kleur/colors';
import { type Adr, withAdr } from './adr-labels';

export type RuleStatus = 'OK' | 'VIOLATION';

export function formatRuleStatus(
	status: RuleStatus,
	label: string,
	...adrs: Adr[]
): string {
	return `${status} ${withAdr(label, ...adrs)}`;
}

export function formatRuleSuccess(label: string, ...adrs: Adr[]): string {
	return green(formatRuleStatus('OK', label, ...adrs));
}

export function formatRuleViolation(label: string, ...adrs: Adr[]): string {
	return red(formatRuleStatus('VIOLATION', label, ...adrs));
}

export function formatRuleTitle(
	label: string,
	count: number | undefined,
	...adrs: Adr[]
): string {
	return withAdr(count === undefined ? label : `${label} (${count})`, ...adrs);
}
