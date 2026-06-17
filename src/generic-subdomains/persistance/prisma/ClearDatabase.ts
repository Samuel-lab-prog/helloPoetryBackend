import { prisma } from '@Prisma/PrismaClient';

export async function clearDatabase() {
	await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "_PoemMentions",
      "_PoemToTag",
      "UserNotificationSetting",
      "Notification",
      "CollectionItem",
      "Collection",
      "SavedPoem",
      "UserMention",
      "BlockedUser",
      "FriendshipRequest",
      "UserSanction",
      "PoemDedication",
      "CommentLike",
      "Comment",
      "PoemLike",
      "Friendship",
      "Poem",
      "Tag",
      "User"
    RESTART IDENTITY CASCADE;
  `);
}
