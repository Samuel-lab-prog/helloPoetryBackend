import { beforeEach, describe, expect, it, mock } from 'bun:test';

// eslint-disable-next-line require-await
const executeRawUnsafeMock = mock(async (_query: string) => undefined);

mock.module('@Prisma/PrismaClient', () => ({
	prisma: {
		$executeRawUnsafe: executeRawUnsafeMock,
	},
}));

const { clearDatabase } = await import('./ClearDatabase');

describe('clearDatabase', () => {
	beforeEach(() => {
		executeRawUnsafeMock.mockClear();
	});

	it('executes truncate statement once', async () => {
		await clearDatabase();

		expect(executeRawUnsafeMock).toHaveBeenCalledTimes(1);
	});

	it('truncates expected tables and restarts identity', async () => {
		await clearDatabase();

		const [query] = executeRawUnsafeMock.mock.calls[0] ?? [];
		const sql = String(query);

		expect(sql).toContain('TRUNCATE TABLE');
		expect(sql).toContain('"BlockedUser"');
		expect(sql).toContain('"FriendshipRequest"');
		expect(sql).toContain('"UserSanction"');
		expect(sql).toContain('"PoemDedication"');
		expect(sql).toContain('"CommentLike"');
		expect(sql).toContain('"Comment"');
		expect(sql).toContain('"PoemLike"');
		expect(sql).toContain('"Friendship"');
		expect(sql).toContain('"Poem"');
		expect(sql).toContain('"User"');
		expect(sql).toContain('RESTART IDENTITY CASCADE');
	});
});
