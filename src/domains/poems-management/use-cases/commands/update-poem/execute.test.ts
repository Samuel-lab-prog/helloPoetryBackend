import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { updatePoemFactory } from './execute';
import {
	PoemAlreadyExistsError,
	PoemNotFoundError,
	CannotUpdatePublishedPoemError,
	CrossUpdateError,
	PoemUpdateDeniedError,
} from '../Errors';
import type { UpdatePoem } from '../Models';

let commandsRepository: any;
let queriesRepository: any;
let slugService: any;
let updatePoem: ReturnType<typeof updatePoemFactory>;

beforeEach(() => {
	commandsRepository = { updatePoem: mock() };
	queriesRepository = { selectPoemById: mock() };
	slugService = { generateSlug: mock() };

	updatePoem = updatePoemFactory({
		commandsRepository,
		queriesRepository,
		slugService,
	});
});

describe('USE-CASE - Update Poem', () => {
	const poemData: UpdatePoem = {
		title: 'Updated Title',
		content: 'Updated Content',
		excerpt: 'Updated Excerpt',
		isCommentable: true,
		visibility: 'public',
		status: 'draft',
		tags: ['fun', 'life'],
	};

	const meta = {
		requesterId: 1,
		requesterStatus: 'active' as const,
		requesterRole: 'moderator' as const,
	};

	it('should throw PoemUpdateDeniedError if requester is not active', () => {
		const inactiveMeta = { ...meta, requesterStatus: 'banned' as const };
		expect(
			updatePoem({ data: poemData, meta: inactiveMeta, poemId: 1 }),
		).rejects.toThrow(PoemUpdateDeniedError);
	});

	it('should throw PoemNotFoundError if poem does not exist', () => {
		queriesRepository.selectPoemById.mockResolvedValue(null);
		expect(updatePoem({ data: poemData, meta, poemId: 42 })).rejects.toThrow(
			PoemNotFoundError,
		);
	});

	it('should throw CrossUpdateError if requester is not the author', () => {
		queriesRepository.selectPoemById.mockResolvedValue({
			id: 1,
			author: { id: 2 },
			status: 'draft',
		});
		expect(updatePoem({ data: poemData, meta, poemId: 1 })).rejects.toThrow(
			CrossUpdateError,
		);
	});

	it('should throw CannotUpdatePublishedPoemError if poem is published', () => {
		queriesRepository.selectPoemById.mockResolvedValue({
			id: 1,
			author: { id: 1 },
			status: 'published',
		});
		expect(updatePoem({ data: poemData, meta, poemId: 1 })).rejects.toThrow(
			CannotUpdatePublishedPoemError,
		);
	});

	it('should throw PoemAlreadyExistsError on conflict', () => {
		queriesRepository.selectPoemById.mockResolvedValue({
			id: 1,
			author: { id: 1 },
			status: 'draft',
		});
		slugService.generateSlug.mockReturnValue('updated-title');
		commandsRepository.updatePoem.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
		});

		expect(updatePoem({ data: poemData, meta, poemId: 1 })).rejects.toThrow(
			PoemAlreadyExistsError,
		);
	});

	it('should propagate unknown errors from repository', () => {
		queriesRepository.selectPoemById.mockResolvedValue({
			id: 1,
			author: { id: 1 },
			status: 'draft',
		});
		slugService.generateSlug.mockReturnValue('updated-title');
		const unknownError = new Error('DB failure');
		commandsRepository.updatePoem.mockResolvedValue({
			ok: false,
			error: unknownError,
		});

		expect(updatePoem({ data: poemData, meta, poemId: 1 })).rejects.toThrow(
			unknownError,
		);
	});

	it('should successfully update poem', async () => {
		queriesRepository.selectPoemById.mockResolvedValue({
			id: 1,
			author: { id: 1 },
			status: 'draft',
		});
		slugService.generateSlug.mockReturnValue('updated-title');
		commandsRepository.updatePoem.mockResolvedValue({
			ok: true,
			data: { ...poemData, slug: 'updated-title' },
		});

		await updatePoem({ data: poemData, meta, poemId: 1 });

		expect(slugService.generateSlug).toHaveBeenCalledWith(poemData.title);
		expect(commandsRepository.updatePoem).toHaveBeenCalledWith(1, {
			...poemData,
			slug: 'updated-title',
		});
	});
});
