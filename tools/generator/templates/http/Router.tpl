import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';

import {
} from '../../schemas/index';

import {
  {{RouterServicesVariableName}},
  type {{RouterServicesInterfaceName}},
} from './Services';

export function create{{RouterName}}(services: {{RouterServicesInterfaceName}}) {
  return new Elysia({ prefix: '/{{RoutePrefix}}' })
    .use(AuthPlugin);
}

export const {{RouterVariableName}} = create{{RouterName}}({{RouterServicesVariableName}});