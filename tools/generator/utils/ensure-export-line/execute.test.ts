import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { join } from 'path';
import { rm } from 'fs/promises';
import { ensureExportLine } from './execute';
import { readFileSafe, writeFileSafe } from '../files-utils/execute';

const TEST_DIR = join(process.cwd(), 'tmp-export-test');
const FILE_NON_EXISTENT = join(TEST_DIR, 'index.ts');
const FILE_EXISTING = join(TEST_DIR, 'indexExisting.ts');

beforeEach(async () => {
	await writeFileSafe(FILE_NON_EXISTENT, '');

	await writeFileSafe(
		FILE_EXISTING,
		`
export * from './moduleA';
export * from './moduleB';
`,
	);
});

afterAll(async () => {
	await rm(TEST_DIR, { recursive: true, force: true });
});

describe('ensureExportLine', () => {
	it('creates a new file if it does not exist', async () => {
		await ensureExportLine(FILE_NON_EXISTENT, "export * from './moduleX';");

		const content = await readFileSafe(FILE_NON_EXISTENT, '');
		expect(content).toContain("export * from './moduleX';");
	});

	it('adds a new export line to existing file', async () => {
		await ensureExportLine(FILE_EXISTING, "export * from './moduleC';");

		const content = await readFileSafe(FILE_EXISTING, '');
		expect(content).toContain("export * from './moduleA';");
		expect(content).toContain("export * from './moduleB';");
		expect(content).toContain("export * from './moduleC';");
	});

	it('does not duplicate existing export line', async () => {
		await ensureExportLine(FILE_EXISTING, "export * from './moduleA';");

		const content = await readFileSafe(FILE_EXISTING, '');
		const count = (content.match(/export \* from '\.\/moduleA';/g) || [])
			.length;
		expect(count).toBe(1);
	});

	it('handles multiple calls and deduplicates all lines', async () => {
		await ensureExportLine(FILE_EXISTING, "export * from './moduleC';");
		await ensureExportLine(FILE_EXISTING, "export * from './moduleC';");
		await ensureExportLine(FILE_EXISTING, "export * from './moduleD';");

		const content = await readFileSafe(FILE_EXISTING, '');
		expect(content).toContain("export * from './moduleA';");
		expect(content).toContain("export * from './moduleB';");
		expect(content).toContain("export * from './moduleC';");
		expect(content).toContain("export * from './moduleD';");

		const countC = (content.match(/export \* from '\.\/moduleC';/g) || [])
			.length;
		expect(countC).toBe(1); // deduplicated
	});

	it('trims whitespace and deduplicates properly', async () => {
		await writeFileSafe(FILE_NON_EXISTENT, "  export * from './moduleY';  \n");

		await ensureExportLine(FILE_NON_EXISTENT, "export * from './moduleY';");

		const content = await readFileSafe(FILE_NON_EXISTENT, '');
		const lines = content.split('\n').filter(Boolean);
		const countY = lines.filter(
			(l) => l === "export * from './moduleY';",
		).length;
		expect(countY).toBe(1); // deduplicated and clean
	});
});
