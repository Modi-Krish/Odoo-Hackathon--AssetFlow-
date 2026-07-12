import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * GET /api/departments
 */
export const getDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.name as head_name, u.email as head_email,
              (SELECT COUNT(*) FROM users WHERE department_id = d.id) as employee_count
       FROM departments d
       LEFT JOIN users u ON d.head_id = u.id
       ORDER BY d.created_at DESC`
    );
    sendSuccess(res, result.rows, 'Departments fetched successfully.');
  } catch (error) {
    console.error('Get departments error:', error);
    sendError(res, 'Failed to fetch departments.');
  }
};

/**
 * GET /api/departments/:id
 */
export const getDepartmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT d.*, u.name as head_name, u.email as head_email,
              (SELECT COUNT(*) FROM users WHERE department_id = d.id) as employee_count
       FROM departments d
       LEFT JOIN users u ON d.head_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Department not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Department fetched successfully.');
  } catch (error) {
    console.error('Get department error:', error);
    sendError(res, 'Failed to fetch department.');
  }
};

/**
 * POST /api/departments
 */
export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, head_id, status } = req.body;

    // Check duplicate name
    const existing = await pool.query('SELECT id FROM departments WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      sendError(res, 'Department name already exists.', 409);
      return;
    }

    const result = await pool.query(
      `INSERT INTO departments (name, head_id, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, head_id || null, status !== undefined ? status : true]
    );

    sendCreated(res, result.rows[0], 'Department created successfully.');
  } catch (error) {
    console.error('Create department error:', error);
    sendError(res, 'Failed to create department.');
  }
};

/**
 * PUT /api/departments/:id
 */
export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, head_id, status } = req.body;

    // Check exists
    const existing = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      sendError(res, 'Department not found.', 404);
      return;
    }

    // Check duplicate name (if changed)
    if (name) {
      const duplicate = await pool.query('SELECT id FROM departments WHERE name = $1 AND id != $2', [name, id]);
      if (duplicate.rows.length > 0) {
        sendError(res, 'Department name already exists.', 409);
        return;
      }
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE departments
       SET name = $1, head_id = $2, status = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        name || current.name,
        head_id !== undefined ? head_id : current.head_id,
        status !== undefined ? status : current.status,
        id,
      ]
    );

    sendSuccess(res, result.rows[0], 'Department updated successfully.');
  } catch (error) {
    console.error('Update department error:', error);
    sendError(res, 'Failed to update department.');
  }
};

/**
 * DELETE /api/departments/:id
 */
export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      sendError(res, 'Department not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Department deleted successfully.');
  } catch (error) {
    console.error('Delete department error:', error);
    sendError(res, 'Failed to delete department.');
  }
};
