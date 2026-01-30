/* eslint-disable require-await */
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

describe('createPoem use case', () => {
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

	it('should successfully create a poem (happy path)', async () => {
		slugService.generateSlug.mockReturnValue('my-poem');
		commandsRepository.insertPoem.mockResolvedValue({ id: 42 });

		const result = await createPoem({ data: poemData, meta });

		expect(result).toEqual({ id: 42 });
		expect(slugService.generateSlug).toHaveBeenCalledWith(poemData.title);
		expect(commandsRepository.insertPoem).toHaveBeenCalledWith({
			...poemData,
			slug: 'my-poem',
		});
	});

	it('should throw PoemCreationDeniedError if requester is suspended', async () => {
		const suspendedMeta = { ...meta, requesterStatus: 'suspended' as const };
		expect(() => createPoem({ data: poemData, meta: suspendedMeta })).toThrow(
			PoemCreationDeniedError,
		);
	});

	it('should throw PoemCreationDeniedError if requester is banned', async () => {
		const bannedMeta = { ...meta, requesterStatus: 'banned' as const };
		expect(() => createPoem({ data: poemData, meta: bannedMeta })).toThrow(
			PoemCreationDeniedError,
		);
	});

	it('should propagate errors from commandsRepository', async () => {
		slugService.generateSlug.mockReturnValue('my-poem');
		commandsRepository.insertPoem.mockRejectedValue(new Error('DB failure'));

		expect(createPoem({ data: poemData, meta })).rejects.toThrow('DB failure');
	});
});
