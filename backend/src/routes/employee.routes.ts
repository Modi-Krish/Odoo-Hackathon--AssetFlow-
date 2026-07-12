import { Router } from 'express';
import {
  getEmployees, getEmployeeById, createEmployee,
  updateEmployee, deleteEmployee,
} from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD), getEmployees);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD), getEmployeeById);
router.post('/', authorize(UserRole.ADMIN), validate(createEmployeeSchema), createEmployee);
router.put('/:id', authorize(UserRole.ADMIN), validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', authorize(UserRole.ADMIN), deleteEmployee);

export default router;
