import { Router } from 'express';
import {
  getCategories, getCategoryById, createCategory,
  updateCategory, deleteCategory,
} from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authorize(UserRole.ADMIN), validate(createCategorySchema), createCategory);
router.put('/:id', authorize(UserRole.ADMIN), validate(updateCategorySchema), updateCategory);
router.delete('/:id', authorize(UserRole.ADMIN), deleteCategory);

export default router;
