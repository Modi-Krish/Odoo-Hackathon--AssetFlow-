import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response';

/**
 * Zod Validation Middleware Factory
 * Validates request body against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        sendError(res, errors.join(', '), 400);
        return;
      }

      req.body = result.data;
      next();
    } catch (error) {
      sendError(res, 'Validation error.', 400);
    }
  };
};
