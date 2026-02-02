import { describe, it, expect } from 'bun:test';
import { canViewPoem } from './policies';

describe('POLICY - Poems Visibility', () => {
	// ───────────────────────────────
	// Author
	// ───────────────────────────────

	it('allows author to see own poem regardless of state', () => {
		const result = canViewPoem({
			viewer: { id: 1 },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'draft',
				visibility: 'private',
				moderationStatus: 'rejected',
			},
		});

		expect(result).toBe(true);
	});

	// ───────────────────────────────
	// Banned
	// ───────────────────────────────

	it('denies banned user even if poem is public', () => {
		const result = canViewPoem({
			viewer: { id: 2, status: 'banned' },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(false);
	});

	// ───────────────────────────────
	// Draft
	// ───────────────────────────────

	it('denies draft poem for non-author', () => {
		const result = canViewPoem({
			viewer: { id: 2 },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'draft',
				visibility: 'public',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(false);
	});

	// ───────────────────────────────
	// Moderation
	// ───────────────────────────────

	it('denies access to not approved poem', () => {
		const result = canViewPoem({
			viewer: { id: 2 },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'pending',
			},
		});

		expect(result).toBe(false);
	});

	it('denies moderator from seeing not approved poem', () => {
		const result = canViewPoem({
			viewer: { id: 99, role: 'moderator' },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'pending',
			},
		});

		expect(result).toBe(false);
	});

	// ───────────────────────────────
	// Public
	// ───────────────────────────────

	it('allows anyone to see public approved poem', () => {
		const result = canViewPoem({
			viewer: {},
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(true);
	});

	// ───────────────────────────────
	// Unlisted
	// ───────────────────────────────

	it('allows unlisted poem only with direct access', () => {
		const withAccess = canViewPoem({
			viewer: { id: 2 },
			author: { id: 1, directAccess: true },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'unlisted',
				moderationStatus: 'approved',
			},
		});

		const withoutAccess = canViewPoem({
			viewer: { id: 2 },
			author: { id: 1, directAccess: false },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'unlisted',
				moderationStatus: 'approved',
			},
		});

		expect(withAccess).toBe(true);
		expect(withoutAccess).toBe(false);
	});

	// ───────────────────────────────
	// Friends
	// ───────────────────────────────

	it('allows friend to see friends-only poem', () => {
		const result = canViewPoem({
			viewer: { id: 2 },
			author: { id: 1, friendIds: [2, 3] },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'friends',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(true);
	});

	it('denies non-friend from seeing friends-only poem', () => {
		const result = canViewPoem({
			viewer: { id: 5 },
			author: { id: 1, friendIds: [2, 3] },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'friends',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(false);
	});

	it('denies anonymous user from friends-only poem', () => {
		const result = canViewPoem({
			viewer: {},
			author: { id: 1, friendIds: [2, 3] },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'friends',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(false);
	});

	// ───────────────────────────────
	// Private
	// ───────────────────────────────

	it('denies private poem for non-author', () => {
		const result = canViewPoem({
			viewer: { id: 2 },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'private',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(false);
	});

	// ───────────────────────────────
	// Moderator
	// ───────────────────────────────

	it('allows moderator to see non-private approved poem', () => {
		const result = canViewPoem({
			viewer: { id: 99, role: 'moderator' },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'public',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(true);
	});

	it('denies moderator from seeing private poem', () => {
		const result = canViewPoem({
			viewer: { id: 99, role: 'moderator' },
			author: { id: 1 },
			poem: {
				id: 10,
				status: 'published',
				visibility: 'private',
				moderationStatus: 'approved',
			},
		});

		expect(result).toBe(false);
	});
});
