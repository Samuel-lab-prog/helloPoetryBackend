import { ForbiddenError } from '@DomainError';

export function compareIds(id1: number, id2: number) {
	return {
		sameOwner() {
			if (id1 !== id2)
				throw new ForbiddenError(`Only owners can perform this action`);
			return this;
		},
		differentOwner() {
			if (id1 === id2)
				throw new ForbiddenError(`Owners cannot perform this action`);
			return this;
		},
	};
}
