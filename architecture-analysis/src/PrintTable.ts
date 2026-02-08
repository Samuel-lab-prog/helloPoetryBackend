import { bold } from 'kleur/colors';
import { divider, section } from './ConsoleFormat';

export type TableColumn<Row> = {
	header: string;
	width: number;
	align?: 'left' | 'right';
	render: (row: Row) => {
		text: string;
		color?: (t: string) => string;
	};
};

const SEP = ' | ';

function pad(
	text: string,
	width: number,
	align: 'left' | 'right' = 'left',
): string {
	return align === 'right'
		? text.padStart(width, ' ')
		: text.padEnd(width, ' ');
}

export function printTable<Row>(
	title: string,
	columns: TableColumn<Row>[],
	rows: Row[],
): void {
	const totalWidth =
		columns.reduce((sum, c) => sum + c.width, 0) +
		SEP.length * (columns.length - 1);

	section(title);

	console.log(
		bold(columns.map((c) => pad(c.header, c.width, c.align)).join(SEP)),
	);

	console.log(divider('·', totalWidth));

	rows.forEach((row) => {
		console.log(
			columns
				.map((c) => {
					const { text, color } = c.render(row);
					const padded = pad(text, c.width, c.align);
					return color ? color(padded) : padded;
				})
				.join(SEP),
		);
	});
}
