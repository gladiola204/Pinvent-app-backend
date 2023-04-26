import express from 'express';
import { protection } from '../middlewares/authMiddleware';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../controllers/productController';
import { upload } from '../utils/uploadFiles';

export const productRouter = express.Router();

productRouter.post('/', protection, upload.single('image'), createProduct);
productRouter.patch('/:id', protection, upload.single('image'), updateProduct);
productRouter.get('/', protection, getProducts);
productRouter.get('/:id', protection, getProduct);
productRouter.delete('/:id', protection, deleteProduct);