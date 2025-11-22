import { t } from 'elysia';

export const avatarSchema = t.Object(
  {
    id: t.Number(),
    name: t.String(),
    path: t.String(),
  },
  {
    examples: [{ id: 1, name: 'Kuromi', path: 'Kuromi.png' }],
  }
);
