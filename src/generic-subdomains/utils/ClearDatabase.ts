import { prisma } from '@PrismaClient';

export async function clearDatabase() {
	await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "BlockedUser",
      "FriendshipRequest",
      "UserSanction",
      "PoemDedication",
      "CommentLike",
      "Comment",
      "PoemLike",
      "Friendship",
      "Poem",
      "User"
    RESTART IDENTITY CASCADE;
  `);
}
