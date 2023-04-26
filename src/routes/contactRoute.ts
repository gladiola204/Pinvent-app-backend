import { Router } from 'express';
import { protection } from '../middlewares/authMiddleware';
import { contactWithUs } from '../controllers/contactController';

export const contactRouter = Router();

contactRouter.post('/', protection, contactWithUs);