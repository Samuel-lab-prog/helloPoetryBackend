import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { unblockUserFactory } from './execute';
import {
	SelfReferenceError,
	BlockedRelationshipNotFoundError,
} from '../Errors';

describe('USE-CASE - Unblock User', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let unblockUser: any;

	beforeEach(() => {
		commandsRepository = {
			unblockUser: mock(),
		};

		queriesRepository = {
			findBlockedRelationship: mock(),
		};

		unblockUser = unblockUserFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('Does not allow self reference', () => {
		expect(
			unblockUser({ requesterId: 1, addresseeId: 1 }),
		).rejects.toBeInstanceOf(SelfReferenceError);
	});

	it('Should abort when blocked relationship does not exist', () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue(null);

		expect(
			unblockUser({ requesterId: 1, addresseeId: 2 }),
		).rejects.toBeInstanceOf(BlockedRelationshipNotFoundError);

		expect(queriesRepository.findBlockedRelationship).toHaveBeenCalledWith({
			userId1: 1,
			userId2: 2,
		});
	});

	it('Should unblock friend request when relationship exists', () => {
		queriesRepository.findBlockedRelationship.mockResolvedValue({ id: 10 });
		commandsRepository.unblockUser.mockResolvedValue(undefined);

		expect(unblockUser({ requesterId: 1, addresseeId: 2 })).resolves.toEqual(
			undefined,
		);

		expect(commandsRepository.unblockUser).toHaveBeenCalledWith(1, 2);
	});
});
