import { prisma } from '@PrismaClient';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/QueriesRepository';

import type {} from // Select models will be imported here
'../../use-cases/queries';

import {} from // TODO
'./SelectsModels';

import {} from // TODO
'./Helpers';

export const queriesRepository: QueriesRepository = {};
