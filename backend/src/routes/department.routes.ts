import { Router } from 'express';
import {
  getDepartments, getDepartmentById, createDepartment,
  updateDepartment, deleteDepartment,
} from '../controllers/department.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize(UserRole.ADMIN), validate(createDepartmentSchema), createDepartment);
router.put('/:id', authorize(UserRole.ADMIN), validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', authorize(UserRole.ADMIN), deleteDepartment);

export default router;
