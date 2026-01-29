import { prisma } from '@PrismaClient';

export function clearDatabase() {
	return prisma.$transaction([
		prisma.blockedFriend.deleteMany(),
		prisma.friendshipRequest.deleteMany(),
		prisma.friendshipRequest.deleteMany(),
		prisma.userSanction.deleteMany(),
		prisma.comment.deleteMany(),
		prisma.poemLike.deleteMany(),
		prisma.friendship.deleteMany(),
		prisma.poem.deleteMany(),
		prisma.user.deleteMany(),
	]);
}
