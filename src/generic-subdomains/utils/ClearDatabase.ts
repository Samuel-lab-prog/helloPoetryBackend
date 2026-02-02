import { prisma } from '@PrismaClient';

export async function clearDatabase() {
	await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "BlockedUser",
      "FriendshipRequest",
      "UserSanction",
      "CommentLike",
      "Comment",
      "PoemLike",
      "Friendship",
      "Poem",
      "User"
    RESTART IDENTITY CASCADE;
  `);
}
