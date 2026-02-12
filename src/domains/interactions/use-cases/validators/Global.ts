import { user } from './User';
import { poem } from './Poem';
import { relation } from './UsersRelation';
import { checkContent } from './Content';

export function v() {
	return {
		user,
		poem,
		relation,
		checkContent,
	};
}
