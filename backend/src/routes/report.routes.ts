import { Router } from 'express';
import { getReports } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD), getReports);

export default router;
