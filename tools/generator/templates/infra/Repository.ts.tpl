  import { prisma } from '@PrismaClient';
  import { withPrismaErrorHandling } from '@PrismaErrorHandler';

  import type {
    {{RepositoryInterfaceName}},
  } from '../../ports/QueriesRepository';

  import type {
    // Select models will be imported here
  } from '../../use-cases/queries';

  import {
    // TODO
  } from './SelectsModels';

  import {
    // TODO
  } from './Helpers';



  export const {{RepositoryVariableName}}: {{RepositoryInterfaceName}} = {
  };
