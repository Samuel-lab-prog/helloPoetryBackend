import type { {{RepositoryType}} } from '../../../ports/{{RepositoryFile}}';
import type { {{DataModel}} } from '../{{#if isCommand}}commands-models{{else}}read-models{{/if}}/{{DataModel}}';
import { } from '../errors';
import { } from '../dtos';
import { } from '../policies/policies';

interface Dependencies {
  {{repositoryVar}}: {{RepositoryType}};
}

export interface {{UseCaseName}}Params {
  requesterId: number;
}

export function {{factoryName}}({ {{repositoryVar}} }: Dependencies) {
  return async function {{useCaseName}}(
    params: {{UseCaseName}}Params,
  ): Promise<{{DataModel}}[]> {
    const result = await {{repositoryVar}}.{{repositoryMethod}}({
      requesterId: params.requesterId,
    });

    {{#if hasPolicy}}
    return result.filter((item) =>
      {{PolicyName}}({
        // TODO: map domain data
      }),
    );
    {{else}}
    return result;
    {{/if}}
  };
}
