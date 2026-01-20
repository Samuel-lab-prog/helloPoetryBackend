import { describe, it, expect, afterAll } from 'bun:test';
import { join } from 'path';
import { rm } from 'fs/promises';
import { readFileSafe, writeFileSafe, ensureFileExists } from './execute';

const TEST_DIR = join(process.cwd(), 'tmp-file-test');
const FILE_NON_EXISTENT = join(TEST_DIR, 'newFile.txt');
const FILE_EXISTING = join(TEST_DIR, 'existingFile.txt');

afterAll(async () => {
	await rm(TEST_DIR, { recursive: true, force: true });
});

describe('File Utilities', () => {
	it('creates a new file with initial content if it does not exist', async () => {
		const initialContent = 'Hello, world!';

		// não precisa ler antes
		await ensureFileExists(FILE_NON_EXISTENT, initialContent);

		const contentAfter = await readFileSafe(FILE_NON_EXISTENT, initialContent);
		expect(contentAfter).toBe(initialContent);
	});

	it('reads existing file content without overwriting', async () => {
		const existingContent = 'Existing content';
		await writeFileSafe(FILE_EXISTING, existingContent);

		const content = await readFileSafe(FILE_EXISTING, 'Should not overwrite');
		expect(content).toBe(existingContent);
	});

	it('creates nested directories automatically', async () => {
		const deepFile = join(TEST_DIR, 'nested', 'dir', 'deepFile.txt');
		const initialContent = 'Deep content';

		await writeFileSafe(deepFile, initialContent);

		const content = await readFileSafe(deepFile, '');
		expect(content).toBe(initialContent);
	});

	it('writeFileSafe overwrites content if file exists', async () => {
		await writeFileSafe(FILE_EXISTING, 'New content');
		const content = await readFileSafe(FILE_EXISTING, '');
		expect(content).toBe('New content');
	});

	it('ensureFileExists does not overwrite existing content', async () => {
		const initial = 'Keep me';
		await writeFileSafe(FILE_EXISTING, initial);

		await ensureFileExists(FILE_EXISTING, 'Overwrite?');
		const content = await readFileSafe(FILE_EXISTING, '');
		expect(content).toBe(initial);
	});
});
