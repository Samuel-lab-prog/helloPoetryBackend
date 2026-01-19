import { t } from 'elysia';
import type { {{DataModel}} } from '../../use-cases/{{#if isCommand}}commands/commands-models/{{DataModel}}{{else}}queries/read-models/{{DataModel}}{{/if}}';
import {
{{#each fields}}
  {{this}},
{{/each}}
} from './fields/Enums';

export const {{DataModel}}Schema = t.Object({
{{#each fieldMappings}}
  {{key}}: {{value}},
{{/each}}
});

type _AssertExtends<_T extends _U, _U> = true;
type _Assert{{DataModel}} = _AssertExtends<
  typeof {{DataModel}}Schema.static,
  {{DataModel}}
>;
