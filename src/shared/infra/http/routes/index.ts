import { Router } from 'express';

import scoresRouter from '@modules/scores/infra/http/routes/scores.routes';
import markingsRouter from '@modules/markings/infra/http/routes/markings.routes';

const routes = Router();

routes.use('/scores', scoresRouter);
routes.use('/markings', markingsRouter);

export default routes;
