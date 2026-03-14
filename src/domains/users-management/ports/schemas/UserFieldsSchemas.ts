import { t } from 'elysia';
import { makeValidationError } from '@GenericSubdomains/utils/AppError';

export {
	NameSchema,
	NicknameSchema,
	AvatarUrlSchema,
} from '@SharedKernel/Schemas';

export const EmailSchema = t.String({
	format: 'email',
	example: 'ana@gmail.com',
	...makeValidationError('Invalid email address'),
});

export const PasswordSchema = t.String({
	minLength: 8,
	maxLength: 40,
	example: 'ana12345',
	...makeValidationError(
		'Password must be at least 8 characters long and at most 40 characters long',
	),
});

export const BioSchema = t.String({
	maxLength: 255,
	example: 'Average poetry lover.',
	...makeValidationError('Bio must be at most 255 characters long'),
});
