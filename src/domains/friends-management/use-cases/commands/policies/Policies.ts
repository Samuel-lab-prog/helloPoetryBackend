type RequestContext = {
	fromId: number;
	toId: number;
};

type PolicyResponse = {
	allowed: boolean;
	reason?: string;
};

export function canSendFriendRequest(context: RequestContext): PolicyResponse {
	if (context.fromId === context.toId) {
		return { allowed: false, reason: 'Cannot send friend request to yourself' };
	}
	return { allowed: true };
}
