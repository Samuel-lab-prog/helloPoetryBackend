import { describe, it, expect } from 'bun:test';

import { canUpdateData } from './policies';

describe('canUpdateData', () => {
	it('should allow update when requester is the target user', () => {
		const result = canUpdateData({
			requesterId: 10,
			targetId: 10,
		});

		expect(result).toBe(true);
	});

	it('should deny update when requester is not the target user', () => {
		const result = canUpdateData({
			requesterId: 1,
			targetId: 2,
		});

		expect(result).toBe(false);
	});
});
