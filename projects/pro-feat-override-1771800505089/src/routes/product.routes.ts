import { Router } from 'express';
import { listProduct, createProduct } from '../controllers/product.controller';

const router = Router();
router.get('/', listProduct);
router.post('/', createProduct);
export default router;