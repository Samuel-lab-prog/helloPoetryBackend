import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { createPoemFactory } from './execute';
import { PoemCreationDeniedError } from '../Errors';

let commandsRepository: any;
let slugService: any;
let createPoem: ReturnType<typeof createPoemFactory>;

beforeEach(() => {
	commandsRepository = {
		insertPoem: mock(),
	};
	slugService = {
		generateSlug: mock(),
	};

	createPoem = createPoemFactory({ commandsRepository, slugService });
});

describe('USE-CASE - Create Poem', () => {
	const poemData = {
		title: 'My Poem',
		content: 'Some content',
		excerpt: 'Some excerpt',
		authorId: 1,
	};

	const meta = {
		requesterId: 1,
		requesterStatus: 'active' as const,
		requesterRole: 'moderator' as const,
	};

	it('Does not allow poem creation if requester is suspended', () => {
		const suspendedMeta = { ...meta, requesterStatus: 'suspended' as const };
		expect(() => createPoem({ data: poemData, meta: suspendedMeta })).toThrow(
			PoemCreationDeniedError,
		);
	});

	it('Does not allow poem creation if requester is banned', () => {
		const bannedMeta = { ...meta, requesterStatus: 'banned' as const };
		expect(() => createPoem({ data: poemData, meta: bannedMeta })).toThrow(
			PoemCreationDeniedError,
		);
	});

	it('Should correctly propagate errors from repository', () => {
		slugService.generateSlug.mockReturnValue('my-poem');
		commandsRepository.insertPoem.mockRejectedValue(new Error('DB failure'));

		expect(createPoem({ data: poemData, meta })).rejects.toThrow('DB failure');
	});

	it('Should create a poem when no errors occur', async () => {
		slugService.generateSlug.mockReturnValue('my-poem');
		commandsRepository.insertPoem.mockResolvedValue({
			ok: true,
			data: { id: 42 },
		});

		const result = await createPoem({ data: poemData, meta });

		expect(result).toHaveProperty('id', 42);
		expect(slugService.generateSlug).toHaveBeenCalledWith(poemData.title);
		expect(commandsRepository.insertPoem).toHaveBeenCalledWith({
			...poemData,
			slug: 'my-poem',
		});
	});
});
