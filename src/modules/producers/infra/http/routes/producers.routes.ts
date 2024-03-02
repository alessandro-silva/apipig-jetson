import { Router } from 'express';

// import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ProducersController from '../controllers/ProducersController';

const producersController = new ProducersController();
const producersRouter = Router();

// producersRouter.use(ensureAuthenticated);

producersRouter.get('/', producersController.index);

// producersRouter.get('/show', producersController.show);

producersRouter.post('/', producersController.create);

// producersRouter.put('/', producersController.update);

export default producersRouter;
