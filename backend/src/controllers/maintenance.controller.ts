import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * POST /api/maintenance
 * Raise a maintenance request
 */
export const createMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asset_id, issue, priority, attachments } = req.body;

    // Check asset exists
    const asset = await pool.query('SELECT * FROM assets WHERE id = $1', [asset_id]);
    if (asset.rows.length === 0) {
      sendError(res, 'Asset not found.', 404);
      return;
    }

    const result = await pool.query(
      `INSERT INTO maintenance_requests (asset_id, requested_by, issue, priority, attachments)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [asset_id, req.user!.id, issue, priority || 'medium', attachments || null]
    );

    // Notify admins and asset managers
    const managers = await pool.query(
      `SELECT id FROM users WHERE role IN ('admin', 'asset_manager') AND status = true`
    );

    for (const manager of managers.rows) {
      await pool.query(
        `INSERT INTO notifications (title, description, user_id)
         VALUES ($1, $2, $3)`,
        ['Maintenance Request', `New maintenance request for ${asset.rows[0].name}: ${issue}`, manager.id]
      );
    }

    sendCreated(res, result.rows[0], 'Maintenance request created successfully.');
  } catch (error) {
    console.error('Create maintenance error:', error);
    sendError(res, 'Failed to create maintenance request.');
  }
};

/**
 * GET /api/maintenance
 */
export const getMaintenanceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, asset_id } = req.query;

    let query = `
      SELECT mr.*, a.name as asset_name, a.asset_tag,
             u.name as requested_by_name,
             t.name as technician_name,
             ab.name as approved_by_name
      FROM maintenance_requests mr
      LEFT JOIN assets a ON mr.asset_id = a.id
      LEFT JOIN users u ON mr.requested_by = u.id
      LEFT JOIN users t ON mr.technician_id = t.id
      LEFT JOIN users ab ON mr.approved_by = ab.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND mr.status = $${paramIndex++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND mr.priority = $${paramIndex++}`;
      params.push(priority);
    }
    if (asset_id) {
      query += ` AND mr.asset_id = $${paramIndex++}`;
      params.push(asset_id);
    }

    query += ' ORDER BY mr.created_at DESC';

    const result = await pool.query(query, params);
    sendSuccess(res, result.rows, 'Maintenance requests fetched successfully.');
  } catch (error) {
    console.error('Get maintenance error:', error);
    sendError(res, 'Failed to fetch maintenance requests.');
  }
};

/**
 * PUT /api/maintenance/:id/approve
 * Approve maintenance request
 */
export const approveMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    const existing = await pool.query(
      'SELECT * FROM maintenance_requests WHERE id = $1 AND status = $2',
      [id, 'pending']
    );

    if (existing.rows.length === 0) {
      sendError(res, 'Pending maintenance request not found.', 404);
      return;
    }

    const result = await pool.query(
      `UPDATE maintenance_requests
       SET status = 'approved', approved_by = $1, technician_id = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [req.user!.id, technician_id || null, id]
    );

    // Update asset status to under maintenance
    await pool.query(
      `UPDATE assets SET status = 'under_maintenance', updated_at = NOW() WHERE id = $1`,
      [existing.rows[0].asset_id]
    );

    // Notify requester
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      ['Maintenance Approved', 'Your maintenance request has been approved.', existing.rows[0].requested_by]
    );

    sendSuccess(res, result.rows[0], 'Maintenance request approved.');
  } catch (error) {
    console.error('Approve maintenance error:', error);
    sendError(res, 'Failed to approve maintenance request.');
  }
};

/**
 * PUT /api/maintenance/:id/reject
 */
export const rejectMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE maintenance_requests
       SET status = 'rejected', approved_by = $1, updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [req.user!.id, id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Pending maintenance request not found.', 404);
      return;
    }

    // Notify requester
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      ['Maintenance Rejected', 'Your maintenance request has been rejected.', result.rows[0].requested_by]
    );

    sendSuccess(res, result.rows[0], 'Maintenance request rejected.');
  } catch (error) {
    console.error('Reject maintenance error:', error);
    sendError(res, 'Failed to reject maintenance request.');
  }
};

/**
 * PUT /api/maintenance/:id/progress
 * Move maintenance to in_progress
 */
export const startMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE maintenance_requests
       SET status = 'in_progress', updated_at = NOW()
       WHERE id = $1 AND status = 'approved'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Approved maintenance request not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Maintenance in progress.');
  } catch (error) {
    console.error('Start maintenance error:', error);
    sendError(res, 'Failed to update maintenance status.');
  }
};

/**
 * PUT /api/maintenance/:id/resolve
 * Resolve maintenance request
 */
export const resolveMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT * FROM maintenance_requests WHERE id = $1 AND status IN ('approved', 'in_progress')`,
      [id]
    );

    if (existing.rows.length === 0) {
      sendError(res, 'Active maintenance request not found.', 404);
      return;
    }

    const result = await pool.query(
      `UPDATE maintenance_requests
       SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    // Update asset status back to available
    await pool.query(
      `UPDATE assets SET status = 'available', updated_at = NOW() WHERE id = $1`,
      [existing.rows[0].asset_id]
    );

    // Notify requester
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      ['Maintenance Resolved', 'Your maintenance request has been resolved.', existing.rows[0].requested_by]
    );

    sendSuccess(res, result.rows[0], 'Maintenance resolved.');
  } catch (error) {
    console.error('Resolve maintenance error:', error);
    sendError(res, 'Failed to resolve maintenance.');
  }
};
