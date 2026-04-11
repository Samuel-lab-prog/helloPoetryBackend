import { mock } from 'bun:test';
import {
	type MockedContract,
	createMockedContract,
	makeParams,
	makeSut,
} from '@GenericSubdomains/utils/TestUtils';
import type {
	CommandsRepository,
	ModeratePoemParams,
} from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import type { PoemModerationRead } from '../../ports/models';
import { moderatePoemFactory } from '../commands/moderate-poem/execute';
import { eventBus } from '@SharedKernel/events/EventBus';

const DEFAULT_POEM_ID = 1;
const DEFAULT_POEM_TITLE = 'Test Poem';
const DEFAULT_POEM_MODERATION_STATUS: PoemModerationRead['moderationStatus'] =
	'pending';
const DEFAULT_AUTHOR_ID = 10;
const DEFAULT_AUTHOR_NICKNAME = 'author';
const DEFAULT_REQUESTER_ID = 99;

type ModerationPoemSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
};

function makePoem(
	overrides: Partial<PoemModerationRead> = {},
): PoemModerationRead {
	return {
		id: DEFAULT_POEM_ID,
		title: DEFAULT_POEM_TITLE,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		author: {
			id: DEFAULT_AUTHOR_ID,
			nickname: DEFAULT_AUTHOR_NICKNAME,
			avatarUrl: null,
		},
		...overrides,
	};
}

function moderationPoemMockFactories(): ModerationPoemSutMocks {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			createBan: mock(),
			createSuspension: mock(),
			updatePoemModerationStatus: mock(),
			endBan: mock(),
			endSuspension: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			selectActiveBanByUserId: mock(),
			selectActiveSuspensionByUserId: mock(),
			selectUserSanctions: mock(),
			selectPoemById: mock(),
			selectPoemNotificationsData: mock(),
		}),
	};
}

export function makeModerationPoemScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		(deps: ModerationPoemSutMocks) => ({
			moderatePoem: moderatePoemFactory({
				commandsRepository: deps.commandsRepository,
				queriesRepository: deps.queriesRepository,
				eventBus,
			}),
		}),
		moderationPoemMockFactories(),
	);

	return {
		withPoem(overrides: Partial<PoemModerationRead> = {}) {
			mocks.queriesRepository.selectPoemById.mockResolvedValue(
				makePoem(overrides),
			);
			return this;
		},

		withPoemNotFound() {
			mocks.queriesRepository.selectPoemById.mockResolvedValue(null);
			return this;
		},

		withModeratedPoem(
			params: {
				id?: number;
				moderationStatus?: PoemModerationRead['moderationStatus'];
			} = {},
		) {
			mocks.commandsRepository.updatePoemModerationStatus.mockResolvedValue({
				ok: true,
				data: {
					id: params.id ?? DEFAULT_POEM_ID,
					moderationStatus:
						params.moderationStatus ?? DEFAULT_POEM_MODERATION_STATUS,
				},
			});
			return this;
		},

		executeModeratePoem(
			params: Partial<ModeratePoemParams> = {},
		): ReturnType<typeof sutFactory.moderatePoem> {
			const defaultMeta: ModeratePoemParams['meta'] = {
				requesterId: DEFAULT_REQUESTER_ID,
				requesterStatus: 'active',
				requesterRole: 'moderator',
			};

			return sutFactory.moderatePoem({
				poemId: params.poemId ?? DEFAULT_POEM_ID,
				moderationStatus:
					params.moderationStatus ?? DEFAULT_POEM_MODERATION_STATUS,
				meta: makeParams(defaultMeta, params.meta),
			});
		},

		get mocks(): ModerationPoemSutMocks {
			return mocks;
		},
	};
}
