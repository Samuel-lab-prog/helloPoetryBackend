/* eslint-disable max-lines-per-function */
import type { BanUserParams, SuspendUserParams } from '../../ports/commands';
import { makeParams, makeSut } from '@GenericSubdomains/utils/TestUtils';
import {
	givenActiveBan,
	givenActiveSuspension,
	givenBanCreated,
	givenNoActiveBan,
	givenNoActiveSuspension,
	givenSuspensionCreated,
	givenUser,
	type ActiveBanOverride,
	type ActiveSuspensionOverride,
	type UserBasicInfoOverride,
} from './Givens';
import {
	moderationFactory,
	moderationMockFactories,
	type ModerationSutMocks,
} from './SutMocks';
import {
	DEFAULT_REASON,
	DEFAULT_REQUESTER_ID,
	DEFAULT_USER_ID,
} from './Constants';

export function makeModerationScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		moderationFactory,
		moderationMockFactories(),
	);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},

		withNoActiveBan() {
			givenNoActiveBan(mocks.queriesRepository);
			return this;
		},

		withActiveBan(overrides: ActiveBanOverride = {}) {
			givenActiveBan(mocks.queriesRepository, overrides);
			return this;
		},

		withNoActiveSuspension() {
			givenNoActiveSuspension(mocks.queriesRepository);
			return this;
		},

		withActiveSuspension(overrides: ActiveSuspensionOverride = {}) {
			givenActiveSuspension(mocks.queriesRepository, overrides);
			return this;
		},

		withBanCreated(
			overrides: Partial<
				Awaited<
					ReturnType<ModerationSutMocks['commandsRepository']['createBan']>
				>
			> = {},
		) {
			givenBanCreated(mocks.commandsRepository, overrides);
			return this;
		},

		withSuspensionCreated(
			overrides: Partial<
				Awaited<
					ReturnType<
						ModerationSutMocks['commandsRepository']['createSuspension']
					>
				>
			> = {},
		) {
			givenSuspensionCreated(mocks.commandsRepository, overrides);
			return this;
		},

		executeBanUser(params: Partial<BanUserParams> = {}) {
			return sutFactory.banUser(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						reason: DEFAULT_REASON,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
					},
					params,
				),
			);
		},

		executeSuspendUser(params: Partial<SuspendUserParams> = {}) {
			return sutFactory.suspendUser(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						reason: DEFAULT_REASON,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
					},
					params,
				),
			);
		},

		get mocks(): ModerationSutMocks {
			return mocks;
		},
	};
}
