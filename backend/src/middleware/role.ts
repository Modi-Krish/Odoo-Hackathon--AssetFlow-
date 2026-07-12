import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { sendError } from '../utils/response';

/**
 * Role-Based Access Control Middleware Factory
 * Usage: authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Access denied. Insufficient permissions.', 403);
      return;
    }

    next();
  };
};
