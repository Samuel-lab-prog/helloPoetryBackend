import { beforeEach, describe, expect, it, mock } from 'bun:test';

// eslint-disable-next-line require-await
const executeRawUnsafeMock = mock(async (_query: string) => undefined);

mock.module('@Prisma/PrismaClient', () => ({
	prisma: {
		$executeRawUnsafe: executeRawUnsafeMock,
	},
}));

const { applicationTables, clearDatabase } = await import('./ClearDatabase');

const expectedApplicationTables = [
	'_PoemMentions',
	'_PoemToTag',
	'BlockedUser',
	'Collection',
	'CollectionItem',
	'Comment',
	'CommentLike',
	'Friendship',
	'FriendshipRequest',
	'Notification',
	'Poem',
	'PoemDedication',
	'PoemLike',
	'SavedPoem',
	'Tag',
	'User',
	'UserMention',
	'UserNotificationSetting',
	'UserSanction',
] as const;

describe('clearDatabase', () => {
	beforeEach(() => {
		executeRawUnsafeMock.mockClear();
	});

	it('executes truncate statement once', async () => {
		await clearDatabase();

		expect(executeRawUnsafeMock).toHaveBeenCalledTimes(1);
	});

	it('truncates every application table and restarts identity', async () => {
		await clearDatabase();

		const [query] = executeRawUnsafeMock.mock.calls[0] ?? [];
		const sql = String(query);

		expect(sql).toContain('TRUNCATE TABLE');
		expect(applicationTables).toEqual(expectedApplicationTables);
		for (const table of expectedApplicationTables) {
			expect(sql).toContain(`"${table}"`);
		}
		expect(sql).not.toContain('"_prisma_migrations"');
		expect(sql).toContain('RESTART IDENTITY CASCADE');
	});
});
