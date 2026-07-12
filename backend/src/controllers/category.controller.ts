import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * GET /api/categories
 */
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM assets WHERE category_id = c.id) as asset_count
       FROM asset_categories c
       ORDER BY c.created_at DESC`
    );
    sendSuccess(res, result.rows, 'Categories fetched successfully.');
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to fetch categories.');
  }
};

/**
 * GET /api/categories/:id
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM assets WHERE category_id = c.id) as asset_count
       FROM asset_categories c
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Category not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Category fetched successfully.');
  } catch (error) {
    console.error('Get category error:', error);
    sendError(res, 'Failed to fetch category.');
  }
};

/**
 * POST /api/categories
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Check duplicate
    const existing = await pool.query('SELECT id FROM asset_categories WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      sendError(res, 'Category name already exists.', 409);
      return;
    }

    const result = await pool.query(
      `INSERT INTO asset_categories (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description || null]
    );

    sendCreated(res, result.rows[0], 'Category created successfully.');
  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 'Failed to create category.');
  }
};

/**
 * PUT /api/categories/:id
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await pool.query('SELECT * FROM asset_categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      sendError(res, 'Category not found.', 404);
      return;
    }

    if (name) {
      const duplicate = await pool.query('SELECT id FROM asset_categories WHERE name = $1 AND id != $2', [name, id]);
      if (duplicate.rows.length > 0) {
        sendError(res, 'Category name already exists.', 409);
        return;
      }
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE asset_categories
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name || current.name, description !== undefined ? description : current.description, id]
    );

    sendSuccess(res, result.rows[0], 'Category updated successfully.');
  } catch (error) {
    console.error('Update category error:', error);
    sendError(res, 'Failed to update category.');
  }
};

/**
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM asset_categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      sendError(res, 'Category not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Category deleted successfully.');
  } catch (error) {
    console.error('Delete category error:', error);
    sendError(res, 'Failed to delete category.');
  }
};
