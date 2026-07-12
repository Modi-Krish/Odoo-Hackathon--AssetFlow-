import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * GET /api/employees
 */
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department_id, role, status } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department_id, u.status, u.created_at, u.updated_at,
             d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (department_id) {
      query += ` AND u.department_id = $${paramIndex++}`;
      params.push(department_id);
    }
    if (role) {
      query += ` AND u.role = $${paramIndex++}`;
      params.push(role);
    }
    if (status !== undefined) {
      query += ` AND u.status = $${paramIndex++}`;
      params.push(status === 'true');
    }

    query += ' ORDER BY u.created_at DESC';

    const result = await pool.query(query, params);
    sendSuccess(res, result.rows, 'Employees fetched successfully.');
  } catch (error) {
    console.error('Get employees error:', error);
    sendError(res, 'Failed to fetch employees.');
  }
};

/**
 * GET /api/employees/:id
 */
export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.status, u.created_at, u.updated_at,
              d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Employee not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Employee fetched successfully.');
  } catch (error) {
    console.error('Get employee error:', error);
    sendError(res, 'Failed to fetch employee.');
  }
};

/**
 * POST /api/employees
 */
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department_id, status } = req.body;

    // Check duplicate email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      sendError(res, 'Email already registered.', 409);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, department_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, department_id, status, created_at`,
      [name, email, hashedPassword, role || 'employee', department_id || null, status !== undefined ? status : true]
    );

    sendCreated(res, result.rows[0], 'Employee created successfully.');
  } catch (error) {
    console.error('Create employee error:', error);
    sendError(res, 'Failed to create employee.');
  }
};

/**
 * PUT /api/employees/:id
 */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, department_id, status } = req.body;

    // Check exists
    const existing = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      sendError(res, 'Employee not found.', 404);
      return;
    }

    // Check duplicate email (if changed)
    if (email) {
      const duplicate = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (duplicate.rows.length > 0) {
        sendError(res, 'Email already registered by another user.', 409);
        return;
      }
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, role = $3, department_id = $4, status = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, email, role, department_id, status, created_at, updated_at`,
      [
        name || current.name,
        email || current.email,
        role || current.role,
        department_id !== undefined ? department_id : current.department_id,
        status !== undefined ? status : current.status,
        id,
      ]
    );

    sendSuccess(res, result.rows[0], 'Employee updated successfully.');
  } catch (error) {
    console.error('Update employee error:', error);
    sendError(res, 'Failed to update employee.');
  }
};

/**
 * DELETE /api/employees/:id
 */
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role',
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Employee not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Employee deleted successfully.');
  } catch (error) {
    console.error('Delete employee error:', error);
    sendError(res, 'Failed to delete employee.');
  }
};
