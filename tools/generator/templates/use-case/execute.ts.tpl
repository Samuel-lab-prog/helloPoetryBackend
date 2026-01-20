import type { {{RepositoryInterfaceType}} } from '../../../ports/{{RepositoryInterfaceFileName}}';
import type { {{#each DataModels}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}} } from '../{{DataModelsFolder}}/Index';
import { {{#each DomainErrors}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}} } from '../Errors';
import { } from '../dtos/Dtos';
import { } from '../policies/Policies';

interface Dependencies {
  {{RepositoryVariable}}: {{RepositoryInterfaceType}};
}

{{#if UseCaseFunctionParameters.length}}
export interface {{UseCaseInterfaceName}} {
  {{#each UseCaseFunctionParameters}}
  {{this.name}}: {{this.type}};
  {{/each}}
}
{{/if}}
export function {{UseCaseFactoryName}}({ {{RepositoryVariable}} }: Dependencies) {
  return async function {{UseCaseFunctionName}}(
    {{#if UseCaseFunctionParameters.length}}
      params: {{UseCaseInterfaceName}}
    {{/if}}
  ): Promise<{{UseCaseFunctionReturnTypes}}> {

    {{#if UseCaseFunctionParameters.length}}
      const { {{#each UseCaseFunctionParameters}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}} } = params;
    {{/if}}

    {{#each RepositoryMethods}}
      const result = await {{../RepositoryVariable}}.{{this.name}}(
        {{#if this.parameters.length}}
          {
            {{#each this.parameters}}
              {{this.name}}{{#unless @last}}, {{/unless}}
            {{/each}}
          }
        {{/if}}
      );
    {{/each}}

    // Implement the use case logic here
    return result;
  };
}

