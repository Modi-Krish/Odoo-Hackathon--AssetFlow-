import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { generateAssetTag } from '../utils/assetTag';

/**
 * GET /api/assets
 */
export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category_id, bookable, search, page, limit } = req.query;

    let query = `
      SELECT a.*, c.name as category_name
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    if (category_id) {
      query += ` AND a.category_id = $${paramIndex++}`;
      params.push(category_id);
    }
    if (bookable !== undefined) {
      query += ` AND a.bookable = $${paramIndex++}`;
      params.push(bookable === 'true');
    }
    if (search) {
      query += ` AND (a.name ILIKE $${paramIndex} OR a.asset_tag ILIKE $${paramIndex} OR a.serial_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count total for pagination
    const countQuery = query.replace('SELECT a.*, c.name as category_name', 'SELECT COUNT(*) as total');
    const countResult = await pool.query(countQuery.replace(/FROM assets a\n\s+LEFT JOIN asset_categories c ON a\.category_id = c\.id/, 'FROM assets a LEFT JOIN asset_categories c ON a.category_id = c.id'), params);

    query += ' ORDER BY a.created_at DESC';

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    sendSuccess(res, {
      assets: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: parseInt(countResult.rows[0]?.total || '0'),
        totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || '0') / limitNum),
      },
    }, 'Assets fetched successfully.');
  } catch (error) {
    console.error('Get assets error:', error);
    sendError(res, 'Failed to fetch assets.');
  }
};

/**
 * GET /api/assets/:id
 */
export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, c.name as category_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Asset not found.', 404);
      return;
    }

    // Get allocation history
    const allocations = await pool.query(
      `SELECT aa.*, u.name as employee_name, u.email as employee_email,
              ab.name as allocated_by_name
       FROM asset_allocations aa
       LEFT JOIN users u ON aa.employee_id = u.id
       LEFT JOIN users ab ON aa.allocated_by = ab.id
       WHERE aa.asset_id = $1
       ORDER BY aa.allocation_date DESC`,
      [id]
    );

    // Get maintenance history
    const maintenance = await pool.query(
      `SELECT mr.*, u.name as requested_by_name
       FROM maintenance_requests mr
       LEFT JOIN users u ON mr.requested_by = u.id
       WHERE mr.asset_id = $1
       ORDER BY mr.created_at DESC`,
      [id]
    );

    sendSuccess(res, {
      ...result.rows[0],
      allocation_history: allocations.rows,
      maintenance_history: maintenance.rows,
    }, 'Asset fetched successfully.');
  } catch (error) {
    console.error('Get asset error:', error);
    sendError(res, 'Failed to fetch asset.');
  }
};

/**
 * POST /api/assets
 */
export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category_id, serial_number, condition, purchase_date, purchase_cost, location, bookable, image_url } = req.body;

    // Check duplicate serial number
    if (serial_number) {
      const existing = await pool.query('SELECT id FROM assets WHERE serial_number = $1', [serial_number]);
      if (existing.rows.length > 0) {
        sendError(res, 'Serial number already exists.', 409);
        return;
      }
    }

    // Auto-generate asset tag
    const assetTag = await generateAssetTag();

    const result = await pool.query(
      `INSERT INTO assets (asset_tag, name, category_id, serial_number, condition, purchase_date, purchase_cost, location, bookable, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [assetTag, name, category_id, serial_number || null, condition || 'new', purchase_date || null, purchase_cost || null, location || null, bookable || false, image_url || null]
    );

    sendCreated(res, result.rows[0], 'Asset registered successfully.');
  } catch (error) {
    console.error('Create asset error:', error);
    sendError(res, 'Failed to register asset.');
  }
};

/**
 * PUT /api/assets/:id
 */
export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category_id, serial_number, condition, status, purchase_date, purchase_cost, location, bookable, image_url } = req.body;

    const existing = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      sendError(res, 'Asset not found.', 404);
      return;
    }

    // Check duplicate serial number (if changed)
    if (serial_number) {
      const duplicate = await pool.query('SELECT id FROM assets WHERE serial_number = $1 AND id != $2', [serial_number, id]);
      if (duplicate.rows.length > 0) {
        sendError(res, 'Serial number already exists.', 409);
        return;
      }
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE assets
       SET name = $1, category_id = $2, serial_number = $3, condition = $4, status = $5,
           purchase_date = $6, purchase_cost = $7, location = $8, bookable = $9, image_url = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        name || current.name,
        category_id || current.category_id,
        serial_number !== undefined ? serial_number : current.serial_number,
        condition || current.condition,
        status || current.status,
        purchase_date !== undefined ? purchase_date : current.purchase_date,
        purchase_cost !== undefined ? purchase_cost : current.purchase_cost,
        location !== undefined ? location : current.location,
        bookable !== undefined ? bookable : current.bookable,
        image_url !== undefined ? image_url : current.image_url,
        id,
      ]
    );

    sendSuccess(res, result.rows[0], 'Asset updated successfully.');
  } catch (error) {
    console.error('Update asset error:', error);
    sendError(res, 'Failed to update asset.');
  }
};

/**
 * DELETE /api/assets/:id
 */
export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      sendError(res, 'Asset not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Asset deleted successfully.');
  } catch (error) {
    console.error('Delete asset error:', error);
    sendError(res, 'Failed to delete asset.');
  }
};
