import { user } from './User';
import { poem } from './Poem';
import { relation } from './UsersRelation';
import { compareIds } from './CompareNumbers';
import { ensure } from './Esnure';

export function validator() {
	return {
		user,
		poem,
		relation,
		compareIds,
		ensure,
	};
}
