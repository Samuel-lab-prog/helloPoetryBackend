import { t } from 'elysia';
import {
	idSchema,
	UserRoleSchema,
	UserStatusSchema,
} from '@SharedKernel/Schemas';

export const AuthClientSchema = t.Object({
	id: idSchema,
	role: UserRoleSchema,
	status: UserStatusSchema,
});
