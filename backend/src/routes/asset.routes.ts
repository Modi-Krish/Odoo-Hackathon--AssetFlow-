import { Router } from 'express';
import {
  getAssets, getAssetById, createAsset,
  updateAsset, deleteAsset,
} from '../controllers/asset.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import { createAssetSchema, updateAssetSchema } from '../validators/asset.validator';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), validate(createAssetSchema), createAsset);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER), validate(updateAssetSchema), updateAsset);
router.delete('/:id', authorize(UserRole.ADMIN), deleteAsset);

export default router;
