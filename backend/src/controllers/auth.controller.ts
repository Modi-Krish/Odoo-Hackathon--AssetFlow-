import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { UserRole } from '../types';

/**
 * POST /api/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department_id } = req.body;

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      sendError(res, 'Email already registered.', 409);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department_id, status, created_at`,
      [name, email, hashedPassword, role || UserRole.EMPLOYEE, department_id || null]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
    });

    // Create welcome notification
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      ['Welcome to AssetFlow', 'Your account has been created successfully.', user.id]
    );

    sendCreated(res, { user, token }, 'Account created successfully.');
  } catch (error) {
    console.error('Signup error:', error);
    sendError(res, 'Failed to create account.');
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.status) {
      sendError(res, 'Account is deactivated. Contact admin.', 403);
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    // Generate JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, { user: userWithoutPassword, token }, 'Login successful.');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Failed to login.');
  }
};

/**
 * POST /api/auth/logout
 * Stateless JWT – client-side token removal
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  sendSuccess(res, null, 'Logged out successfully.');
};

/**
 * GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.status, u.created_at,
              d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'User not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Profile fetched successfully.');
  } catch (error) {
    console.error('Profile error:', error);
    sendError(res, 'Failed to fetch profile.');
  }
};
