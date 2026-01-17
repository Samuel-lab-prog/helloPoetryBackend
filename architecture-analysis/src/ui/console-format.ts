import { blue } from 'kleur/colors';

const TERMINAL_WIDTH = 100;

export function center(text: string, width = TERMINAL_WIDTH): string {
	const pad = Math.max(0, Math.floor((width - text.length) / 2));
	return ' '.repeat(pad) + text;
}

export function divider(char = '─', width = TERMINAL_WIDTH): string {
	return char.repeat(width);
}

export function padRight(text: string, width: number): string {
	return text.padEnd(width, ' ');
}

export function padLeft(text: string, width: number): string {
	return text.padStart(width, ' ');
}

export function section(title: string): void {
	console.log('\n' + divider());
	console.log(center(blue(title.toUpperCase())));
	console.log(divider());
}
