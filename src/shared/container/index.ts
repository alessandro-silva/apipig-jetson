import { container } from 'tsyringe';

import './providers';

import IScoresRepository from '@modules/scores/repositories/IScoresRepository';
import ScoresRepository from '@modules/scores/infra/typeorm/repositories/ScoresRepository';

import IMarkingsRepository from '@modules/markings/repositories/IMarkingsRepository';
import MarkingsRepository from '@modules/markings/infra/typeorm/repositories/MarkingsRepository';

container.registerSingleton<IScoresRepository>(
  'ScoresRepository',
  ScoresRepository,
);

container.registerSingleton<IMarkingsRepository>(
  'MarkingsRepository',
  MarkingsRepository,
);
