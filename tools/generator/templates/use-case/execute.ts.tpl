import type { {{RepositoryType}} } from '../../../ports/{{RepositoryFile}}';
import type { {{#each DataModels}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}} } from '../{{#if isCommand}}commands-models{{else}}read-models{{/if}}/Index';
import { {{#each Errors}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} } from '../Errors';
import { } from '../dtos/Dtos';
import { } from '../policies/Policies';

interface Dependencies {
  {{repositoryVar}}: {{RepositoryType}};
}

export interface {{UseCaseName}}Params {
  {{#each UseCaseParams}}
  {{this.name}}: {{this.type}};
  {{/each}}
}

export function {{factoryName}}({ {{repositoryVar}} }: Dependencies) {
  return async function {{useCaseName}}(params: {{UseCaseName}}Params): Promise<{{UseCaseReturnType}}> {
    const { {{#each UseCaseParams}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}} } = params;

    {{#each RepositoryMethods}}
    const result = await {{../repositoryVar}}.{{this.name}}({
      {{#each this.parameters}}
      {{this.name}}{{#unless @last}}, {{/unless}}
      {{/each}}
    });
    {{/each}}

    // Implement the use case logic here
    return result;
  };
}
