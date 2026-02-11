import { t } from 'elysia';
import {
	idSchema,
	UserRoleSchema,
	UserStatusSchema,
} from '@SharedKernel/Schemas';

export const loginResponseSchema = t.Object({
	id: idSchema,
	role: UserRoleSchema,
	status: UserStatusSchema,
});
