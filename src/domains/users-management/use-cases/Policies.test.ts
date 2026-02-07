import { expect, describe, it } from 'bun:test';
import { canUpdateData, type CanUpdatePolicyInput } from './Policies';

const validInput: CanUpdatePolicyInput = {
	requesterId: 1,
	requesterStatus: 'active',
	targetId: 1,
};

describe('POLICY - Users Management', () => {
	describe('canUpdateData', () => {
		it('Does not allow banned users to update their data', () => {
			const data: CanUpdatePolicyInput = {
				...validInput,
				requesterStatus: 'banned',
			};
			expect(() => canUpdateData(data)).toThrow();
		});

		it('Does not allow users to update other users data', () => {
			const data: CanUpdatePolicyInput = {
				...validInput,
				targetId: 2,
			};
			expect(() => canUpdateData(data)).toThrow();
		});

		it('Allows users to update their own data if they are not banned', () => {
			expect(() => canUpdateData(validInput)).not.toThrow();
		});
	});
});
