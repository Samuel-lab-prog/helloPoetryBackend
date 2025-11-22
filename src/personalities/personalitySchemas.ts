import { t } from 'elysia';

export const personalitySchema = t.Object(
  {
    id: t.Number(),
    trait: t.String(),
  },
  {
    examples: [{ id: 1, trait: 'Kuromi Chaos' }],
  }
);
