import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('❌ Unhandled Error:', err.message);
  console.error(err.stack);
  sendError(res, 'Internal server error.', 500);
};
