import { Router } from 'express';
import {
  allocateAsset, returnAsset, transferAsset,
  approveTransfer, rejectTransfer,
  getAllocationHistory, getTransferRequests,
} from '../controllers/allocation.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import { allocateAssetSchema, returnAssetSchema, transferAssetSchema } from '../validators/allocation.validator';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

// Allocation
router.post('/', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), validate(allocateAssetSchema), allocateAsset);
router.put('/return', validate(returnAssetSchema), returnAsset);

// Transfer
router.put('/transfer', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD), validate(transferAssetSchema), transferAsset);
router.put('/transfer/:id/approve', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), approveTransfer);
router.put('/transfer/:id/reject', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), rejectTransfer);
router.get('/transfers', getTransferRequests);

// History
router.get('/history', getAllocationHistory);

export default router;
