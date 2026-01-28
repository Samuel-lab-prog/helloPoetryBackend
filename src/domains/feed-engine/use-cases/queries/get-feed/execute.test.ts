import { describe, expect, mock, beforeEach, it } from 'bun:test';
import { getFeedFactory } from './execute';

describe('feed-engine', () => {
	describe('getFeed', () => {
		let poemsServices: any;
		let friendsServices: any;

		beforeEach(() => {
			poemsServices = {
				getPoemsByAuthorIds: mock(),
				getPublicPoems: mock(),
				getPoemsByIds: mock(),
			};

			friendsServices = {
				getFollowedUserIds: mock(),
				getBlockedUserIds: mock(),
			};
		});

		function makePoem(id: number, date: string) {
			return {
				id,
				createdAt: new Date(date),
			};
		}

		it('returns 20 most recent poems from friends excluding blocked users', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([1, 2, 3]);
			friendsServices.getBlockedUserIds.mockResolvedValue([2]);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: [
					makePoem(1, '2024-01-01'),
					makePoem(2, '2024-01-05'),
					makePoem(3, '2024-01-03'),
				],
			});

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: [{ id: 2 }, { id: 3 }, { id: 1 }],
			});

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: [
					makePoem(1, '2024-01-01'),
					makePoem(2, '2024-01-05'),
					makePoem(3, '2024-01-03'),
				],
			});

			poemsServices.getPublicPoems.mockResolvedValue({
				poems: [],
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			const result = await getFeed({ userId: 10 });

			expect(friendsServices.getFollowedUserIds).toHaveBeenCalledWith(10);
			expect(friendsServices.getBlockedUserIds).toHaveBeenCalledWith(10);

			expect(poemsServices.getPoemsByAuthorIds).toHaveBeenCalledWith({
				authorIds: [1, 3],
				limit: 50,
			});

			expect(result.map((p) => p.id)).toEqual([2, 3, 1]);
		});

		it('fills feed with public poems when friends poems are insufficient', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([1]);
			friendsServices.getBlockedUserIds.mockResolvedValue([]);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: [makePoem(10, '2024-01-01')],
			});

			poemsServices.getPublicPoems.mockResolvedValue({
				poems: [{ id: 20 }, { id: 21 }, { id: 22 }],
			});

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: [{ id: 10 }, { id: 20 }],
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			const result = await getFeed({ userId: 1 });

			expect(poemsServices.getPublicPoems).toHaveBeenCalled();

			expect(result.length).toBe(2);
			expect(result.map((p) => p.id)).toContain(10);
			expect(result.map((p) => p.id)).toContain(20);
		});

		it('never includes duplicate poem ids', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([1]);
			friendsServices.getBlockedUserIds.mockResolvedValue([]);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: [makePoem(5, '2024-01-01')],
			});

			poemsServices.getPublicPoems.mockResolvedValue({
				poems: [{ id: 5 }, { id: 6 }],
			});

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: [{ id: 5 }, { id: 6 }],
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			const result = await getFeed({ userId: 1 });

			expect(result.map((p) => p.id)).toEqual([5, 6]);
		});

		it('sorts friend poems by createdAt desc before slicing', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([1]);
			friendsServices.getBlockedUserIds.mockResolvedValue([]);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: [
					makePoem(1, '2024-01-01'),
					makePoem(2, '2024-01-10'),
					makePoem(3, '2024-01-05'),
				],
			});

			poemsServices.getPublicPoems.mockResolvedValue({ poems: [] });

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: [{ id: 2 }, { id: 3 }, { id: 1 }],
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			const result = await getFeed({ userId: 1 });

			expect(result.map((p) => p.id)).toEqual([2, 3, 1]);
		});

		it('limits feed to 20 items even if more exist', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([1]);
			friendsServices.getBlockedUserIds.mockResolvedValue([]);

			const manyPoems = Array.from({ length: 30 }, (_, i) =>
				makePoem(i + 1, `2024-01-${String(i + 1).padStart(2, '0')}`),
			);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: manyPoems,
			});

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: manyPoems.slice(0, 20).map((p) => ({ id: p.id })),
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			const result = await getFeed({ userId: 1 });

			expect(result.length).toBe(20);
		});
		it('does not fetch public poems when friend poems already fill feed', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([1]);
			friendsServices.getBlockedUserIds.mockResolvedValue([]);

			const poems = Array.from({ length: 20 }, (_, i) =>
				makePoem(i + 1, '2024-01-01'),
			);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems,
			});

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: poems.map((p) => ({ id: p.id })),
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			await getFeed({ userId: 1 });

			expect(poemsServices.getPublicPoems).not.toHaveBeenCalled();
		});
		it('uses only public poems when user has no friends', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([]);
			friendsServices.getBlockedUserIds.mockResolvedValue([]);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: [],
			});

			poemsServices.getPublicPoems.mockResolvedValue({
				poems: [{ id: 9 }, { id: 8 }],
			});

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: [{ id: 9 }, { id: 8 }],
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			const result = await getFeed({ userId: 1 });

			expect(result.map((p) => p.id)).toEqual([9, 8]);
		});
		it('treats all friends as filtered when all are blocked', async () => {
			friendsServices.getFollowedUserIds.mockResolvedValue([1, 2]);
			friendsServices.getBlockedUserIds.mockResolvedValue([1, 2]);

			poemsServices.getPoemsByAuthorIds.mockResolvedValue({
				poems: [],
			});

			poemsServices.getPublicPoems.mockResolvedValue({
				poems: [{ id: 100 }],
			});

			poemsServices.getPoemsByIds.mockResolvedValue({
				poems: [{ id: 100 }],
			});

			const getFeed = getFeedFactory({
				poemsServices,
				friendsServices,
			});

			const result = await getFeed({ userId: 1 });

			expect(result.map((p) => p.id)).toEqual([100]);
		});
	});
});
