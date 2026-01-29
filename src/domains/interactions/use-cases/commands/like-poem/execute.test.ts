import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { likePoemFactory } from './execute';
import {
	PoemNotFoundError,
	AlreadyLikedError,
	PrivatePoemError,
	FriendsOnlyPoemError,
	UserBlockedError,
} from '../Errors';

describe('likePoemFactory', () => {
	let commandsRepository: {
		createPoemLike: ReturnType<typeof mock>;
		findPoemLike: ReturnType<typeof mock>;
		deletePoemLike: ReturnType<typeof mock>;
		createPoemComment: ReturnType<typeof mock>;
		deletePoemComment: ReturnType<typeof mock>;
	};

	let queriesRepository: {
		existsPoemLike: ReturnType<typeof mock>;
		selectCommentById: ReturnType<typeof mock>;
		findCommentsByPoemId: ReturnType<typeof mock>;
	};

	let poemsContract: {
		getPoemInteractionInfo: ReturnType<typeof mock>;
	};

	let friendsServices: {
		areFriends: ReturnType<typeof mock>;
		areBlocked: ReturnType<typeof mock>;
	};

	beforeEach(() => {
		commandsRepository = {
			createPoemLike: mock(),
			findPoemLike: mock(),
			deletePoemLike: mock(),
			createPoemComment: mock(),
			deletePoemComment: mock(),
		};

		queriesRepository = {
			existsPoemLike: mock(),
			selectCommentById: mock(),
			findCommentsByPoemId: mock(),
		};

		poemsContract = {
			getPoemInteractionInfo: mock(),
		};

		friendsServices = {
			areFriends: mock(),
			areBlocked: mock(),
		};
	});

	it('likes poem successfully', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
			authorId: 2,
			visibility: 'public',
		});

		friendsServices.areBlocked.mockResolvedValue(false);
		queriesRepository.existsPoemLike.mockResolvedValue(false);
		commandsRepository.createPoemLike.mockResolvedValue({
			userId: 1,
			poemId: 10,
		});

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		const result = await likePoem({
			userId: 1,
			poemId: 10,
		});

		expect(result).toEqual({
			userId: 1,
			poemId: 10,
		});

		expect(commandsRepository.createPoemLike).toHaveBeenCalledWith({
			userId: 1,
			poemId: 10,
		});
	});

	it('throws PoemNotFoundError when poem does not exist', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: false,
		});

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
			PoemNotFoundError,
		);

		expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
	});

	it('throws PrivatePoemError when poem is private and user is not author', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
			authorId: 2,
			visibility: 'private',
		});

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
			PrivatePoemError,
		);

		expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
	});

	it('throws FriendsOnlyPoemError when poem is friends-only and users are not friends', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
			authorId: 2,
			visibility: 'friends',
		});

		friendsServices.areFriends.mockResolvedValue(false);

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
			FriendsOnlyPoemError,
		);

		expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
	});

	it('allows friends-only poem when users are friends', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
			authorId: 2,
			visibility: 'friends',
		});

		friendsServices.areFriends.mockResolvedValue(true);
		friendsServices.areBlocked.mockResolvedValue(false);
		queriesRepository.existsPoemLike.mockResolvedValue(false);

		commandsRepository.createPoemLike.mockResolvedValue({
			userId: 1,
			poemId: 10,
		});

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		const result = await likePoem({ userId: 1, poemId: 10 });

		expect(result).toEqual({
			userId: 1,
			poemId: 10,
		});
	});

	it('throws UserBlockedError when users are blocked', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
			authorId: 2,
			visibility: 'public',
		});

		friendsServices.areBlocked.mockResolvedValue(true);

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
			UserBlockedError,
		);

		expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
	});

	it('throws AlreadyLikedError when poem already liked', async () => {
		poemsContract.getPoemInteractionInfo.mockResolvedValue({
			exists: true,
			authorId: 2,
			visibility: 'public',
		});

		friendsServices.areBlocked.mockResolvedValue(false);
		queriesRepository.existsPoemLike.mockResolvedValue(true);

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toBeInstanceOf(
			AlreadyLikedError,
		);

		expect(commandsRepository.createPoemLike).not.toHaveBeenCalled();
	});

	it('does not swallow dependency errors', async () => {
		poemsContract.getPoemInteractionInfo.mockRejectedValue(new Error('boom'));

		const likePoem = likePoemFactory({
			commandsRepository,
			queriesRepository,
			poemsContract,
			friendsServices,
		});

		await expect(likePoem({ userId: 1, poemId: 10 })).rejects.toThrow('boom');
	});
});
