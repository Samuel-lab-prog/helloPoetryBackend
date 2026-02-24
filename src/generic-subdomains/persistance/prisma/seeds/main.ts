import { seedUsers } from './users/Execute';
import { seedPoems } from './poems/Execute';
import { seedFriends } from './friends/Execute';
import { seedFriendRequests } from './friends-requests/Execute';
import { seedComments } from './comments/Execute';
import { seedPoemLikes } from './poem-likes/Execute';
import { seedCommentLikes } from './comment-likes/Execute';

import { green } from 'kleur/colors';
import { clearDatabase } from '@Prisma/clearDatabase';
import { prisma } from '../PrismaClient';

async function main() {
	console.log('Starting database seeding...');

	try {
		await clearDatabase();

		const USERS_AMOUNT = 200;
		const POEMS_AMOUNT = 1200;
		const FRIENDS_AMOUNT = 3000;
		const FRIEND_REQUESTS_AMOUNT = 800;
		const COMMENTS_AMOUNT = 3000;
		const POEM_LIKES_AMOUNT = 10000;
		const COMMENT_LIKES_AMOUNT = 10000;

		/* USERS */
		await seedUsers(USERS_AMOUNT);
		const users = await prisma.user.findMany({ select: { id: true } });
		const userIds = users.map((u) => u.id);

		/* POEMS */
		await seedPoems(userIds, POEMS_AMOUNT);
		const poems = await prisma.poem.findMany({ select: { id: true } });
		const poemIds = poems.map((p) => p.id);

		/* COMMENTS */
		await seedComments(userIds, poemIds, COMMENTS_AMOUNT);
		const comments = await prisma.comment.findMany({ select: { id: true } });
		const commentIds = comments.map((c) => c.id);

		/* SOCIAL GRAPH */
		await seedFriends(userIds, FRIENDS_AMOUNT);
		await seedFriendRequests(userIds, FRIEND_REQUESTS_AMOUNT);

		/* LIKES */
		await seedPoemLikes(userIds, poemIds, POEM_LIKES_AMOUNT);
		await seedCommentLikes(userIds, commentIds, COMMENT_LIKES_AMOUNT);

		console.log(green('✅ Database seeding completed!'));
	} catch (error) {
		console.error('Error during database seeding:', error);
		process.exit(1);
	}
}

main();
