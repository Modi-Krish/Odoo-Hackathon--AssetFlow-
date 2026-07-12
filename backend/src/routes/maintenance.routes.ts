import { Router } from 'express';
import {
  createMaintenanceRequest, getMaintenanceRequests,
  approveMaintenanceRequest, rejectMaintenanceRequest,
  startMaintenance, resolveMaintenance,
} from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import { createMaintenanceSchema, approveMaintenanceSchema } from '../validators/maintenance.validator';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post('/', validate(createMaintenanceSchema), createMaintenanceRequest);
router.get('/', getMaintenanceRequests);
router.put('/:id/approve', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), validate(approveMaintenanceSchema), approveMaintenanceRequest);
router.put('/:id/reject', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), rejectMaintenanceRequest);
router.put('/:id/progress', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), startMaintenance);
router.put('/:id/resolve', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), resolveMaintenance);

export default router;
