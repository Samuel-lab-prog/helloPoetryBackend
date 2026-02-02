Take this as a refererence to generate tests

USE-CASE: execute.ts

import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendRequest } from '../models/Index'; import {
SelfReferenceError, RequestNotFoundError } from '../Errors';

interface Dependencies { commandsRepository: CommandsRepository;
queriesRepository: QueriesRepository; }

interface CancelFriendRequestParams { requesterId: number; addresseeId: number;
}

export function cancelFriendRequestFactory({ commandsRepository,
queriesRepository, }: Dependencies) { return async function cancelFriendRequest(
params: CancelFriendRequestParams, ): Promise<FriendRequest> { const {
requesterId, addresseeId } = params;

    	if (requesterId === addresseeId) {
    		throw new SelfReferenceError();
    	}

    	// There's no need to check for blocking relationships in both directions
    	// since if either user has blocked the other, the request cannot exist.

    	// We also don't need to check for existing friendships, since if they were friends,
    	// there wouldn't be a pending request to cancel.

    	const request = await queriesRepository.findFriendRequest({
    		requesterId,
    		addresseeId,
    	});
    	if (!request) {
    		throw new RequestNotFoundError();
    	}

    	return commandsRepository.cancelFriendRequest({
    		requesterId,
    		addresseeId,
    	});
    };

}

TESTS: execute.test.ts

import { describe, it, expect, beforeEach, mock } from 'bun:test'; import {
cancelFriendRequestFactory } from './execute';

import { RequestNotFoundError, SelfReferenceError } from '../Errors';

describe('USE-CASE - Cancel Friend Request', () => { let commandsRepository:
any; let queriesRepository: any; let cancelFriendRequest: any;

    beforeEach(() => {
    	commandsRepository = {
    		cancelFriendRequest: mock(),
    	};

    	queriesRepository = {
    		findFriendRequest: mock(),
    	};

    	cancelFriendRequest = cancelFriendRequestFactory({
    		commandsRepository,
    		queriesRepository,
    	});
    });

    it('Does not allow self request', () => {
    	expect(
    		cancelFriendRequest({ requesterId: 1, addresseeId: 1 }),
    	).rejects.toBeInstanceOf(SelfReferenceError);
    });

    it('Does not allow canceling if the request does not even exist', () => {
    	queriesRepository.findFriendRequest.mockResolvedValue(null);

    	expect(
    		cancelFriendRequest({ requesterId: 1, addresseeId: 2 }),
    	).rejects.toBeInstanceOf(RequestNotFoundError);
    });

    it('Should cancel the friend request and return the result when no errors occur', () => {
    	const cancelledRequest = { id: 10, requesterId: 1, addresseeId: 2 };
    	queriesRepository.findFriendRequest.mockResolvedValue(cancelledRequest);
    	commandsRepository.cancelFriendRequest.mockResolvedValue(cancelledRequest);
    	expect(
    		cancelFriendRequest({ requesterId: 1, addresseeId: 2 }),
    	).resolves.toEqual(cancelledRequest);
    });

});
