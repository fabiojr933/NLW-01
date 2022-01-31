import express from 'express';
import PointController from './controllers/PointController';
import ItemsController from './controllers/ItemsController';
import multer from 'multer';
import multerConfig from './config/multer';

const routes = express.Router();
const upload = multer(multerConfig);
const pointController = new PointController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);
routes.post('/points', upload.single('image'), pointController.create);
routes.get('/points/:id', pointController.show);
routes.get('/points/', pointController.index);

export default routes;
