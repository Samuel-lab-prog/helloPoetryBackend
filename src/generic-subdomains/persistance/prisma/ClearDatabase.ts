import { prisma } from '@Prisma/PrismaClient';

export const applicationTables = [
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

export async function clearDatabase() {
	const tableList = applicationTables
		.map((table) => `"${table}"`)
		.join(',\n      ');

	await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      ${tableList}
    RESTART IDENTITY CASCADE;
  `);
}
