import { user } from './User';
import { poem } from './Poem';
import { relation } from './UsersRelation';
import { compareIds } from './CompareNumbers';
import { ensureResource } from './CheckResource';

export function validator() {
	return {
		user,
		poem,
		relation,
		compareIds,
		ensureResource,
	};
}
