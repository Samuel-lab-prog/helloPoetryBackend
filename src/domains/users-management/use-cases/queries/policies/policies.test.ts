import { describe, it, expect } from 'bun:test';

import { canAccessUserInfo } from './policies';

describe('canAccessUserInfo', () => {
	it('should allow access when requester is moderator', () => {
		const result = canAccessUserInfo({
			requesterId: 1,
			requesterRole: 'moderator',
			targetId: 999,
		});

		expect(result).toBe(true);
	});

	it('should allow access when requester is the target user', () => {
		const result = canAccessUserInfo({
			requesterId: 5,
			requesterRole: 'user',
			targetId: 5,
		});

		expect(result).toBe(true);
	});
});
