type PolicyInput = {
	requesterId: number;
	targetId: number;
};

export function canUpdateData(c: PolicyInput): boolean {
	return c.requesterId === c.targetId;
}
