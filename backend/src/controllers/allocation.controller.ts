import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * POST /api/allocation
 * Allocate an asset to an employee
 */
export const allocateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asset_id, employee_id, expected_return } = req.body;

    // Check asset exists and is available
    const asset = await pool.query('SELECT * FROM assets WHERE id = $1', [asset_id]);
    if (asset.rows.length === 0) {
      sendError(res, 'Asset not found.', 404);
      return;
    }

    if (asset.rows[0].status !== 'available') {
      sendError(res, `Asset is already ${asset.rows[0].status}. Cannot allocate.`, 400);
      return;
    }

    // Check employee exists
    const employee = await pool.query('SELECT * FROM users WHERE id = $1', [employee_id]);
    if (employee.rows.length === 0) {
      sendError(res, 'Employee not found.', 404);
      return;
    }

    // Create allocation
    const allocation = await pool.query(
      `INSERT INTO asset_allocations (asset_id, employee_id, allocated_by, expected_return)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [asset_id, employee_id, req.user!.id, expected_return || null]
    );

    // Update asset status
    await pool.query(
      `UPDATE assets SET status = 'allocated', updated_at = NOW() WHERE id = $1`,
      [asset_id]
    );

    // Create notification for employee
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      [
        'Asset Assigned',
        `${asset.rows[0].name} (${asset.rows[0].asset_tag}) has been assigned to you.`,
        employee_id,
      ]
    );

    sendCreated(res, allocation.rows[0], 'Asset allocated successfully.');
  } catch (error) {
    console.error('Allocate asset error:', error);
    sendError(res, 'Failed to allocate asset.');
  }
};

/**
 * PUT /api/allocation/return
 * Return an allocated asset
 */
export const returnAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { allocation_id } = req.body;

    // Find the allocation
    const allocation = await pool.query(
      'SELECT * FROM asset_allocations WHERE id = $1 AND returned = false',
      [allocation_id]
    );

    if (allocation.rows.length === 0) {
      sendError(res, 'Active allocation not found.', 404);
      return;
    }

    const alloc = allocation.rows[0];

    // Mark allocation as returned
    await pool.query(
      `UPDATE asset_allocations
       SET returned = true, actual_return = CURRENT_DATE, updated_at = NOW()
       WHERE id = $1`,
      [allocation_id]
    );

    // Update asset status back to available
    await pool.query(
      `UPDATE assets SET status = 'available', updated_at = NOW() WHERE id = $1`,
      [alloc.asset_id]
    );

    // Notification
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      ['Asset Returned', 'An asset has been returned and is now available.', alloc.allocated_by || req.user!.id]
    );

    sendSuccess(res, null, 'Asset returned successfully.');
  } catch (error) {
    console.error('Return asset error:', error);
    sendError(res, 'Failed to return asset.');
  }
};

/**
 * PUT /api/allocation/transfer
 * Create a transfer request
 */
export const transferAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asset_id, from_employee, to_employee, notes } = req.body;

    // Verify asset is allocated to from_employee
    const allocation = await pool.query(
      `SELECT * FROM asset_allocations
       WHERE asset_id = $1 AND employee_id = $2 AND returned = false`,
      [asset_id, from_employee]
    );

    if (allocation.rows.length === 0) {
      sendError(res, 'Asset is not allocated to the source employee.', 400);
      return;
    }

    // Verify to_employee exists
    const toUser = await pool.query('SELECT * FROM users WHERE id = $1', [to_employee]);
    if (toUser.rows.length === 0) {
      sendError(res, 'Target employee not found.', 404);
      return;
    }

    // Create transfer request
    const transfer = await pool.query(
      `INSERT INTO transfer_requests (asset_id, from_employee, to_employee, requested_by, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [asset_id, from_employee, to_employee, req.user!.id, notes || null]
    );

    // Notify relevant parties
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      ['Transfer Request', `A transfer request has been submitted for approval.`, to_employee]
    );

    sendCreated(res, transfer.rows[0], 'Transfer request created successfully.');
  } catch (error) {
    console.error('Transfer asset error:', error);
    sendError(res, 'Failed to create transfer request.');
  }
};

/**
 * PUT /api/allocation/transfer/:id/approve
 * Approve a transfer request
 */
export const approveTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transfer = await pool.query(
      'SELECT * FROM transfer_requests WHERE id = $1 AND status = $2',
      [id, 'pending']
    );

    if (transfer.rows.length === 0) {
      sendError(res, 'Pending transfer request not found.', 404);
      return;
    }

    const t = transfer.rows[0];

    // Approve transfer
    await pool.query(
      `UPDATE transfer_requests SET status = 'approved', approved_by = $1, updated_at = NOW() WHERE id = $2`,
      [req.user!.id, id]
    );

    // Return old allocation
    await pool.query(
      `UPDATE asset_allocations SET returned = true, actual_return = CURRENT_DATE, updated_at = NOW()
       WHERE asset_id = $1 AND employee_id = $2 AND returned = false`,
      [t.asset_id, t.from_employee]
    );

    // Create new allocation
    await pool.query(
      `INSERT INTO asset_allocations (asset_id, employee_id, allocated_by)
       VALUES ($1, $2, $3)`,
      [t.asset_id, t.to_employee, req.user!.id]
    );

    // Notifications
    await pool.query(
      `INSERT INTO notifications (title, description, user_id) VALUES ($1, $2, $3), ($1, $2, $4)`,
      ['Transfer Approved', 'Asset transfer has been approved.', t.from_employee, t.to_employee]
    );

    sendSuccess(res, null, 'Transfer approved successfully.');
  } catch (error) {
    console.error('Approve transfer error:', error);
    sendError(res, 'Failed to approve transfer.');
  }
};

/**
 * PUT /api/allocation/transfer/:id/reject
 * Reject a transfer request
 */
export const rejectTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE transfer_requests SET status = 'rejected', approved_by = $1, updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [req.user!.id, id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Pending transfer request not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Transfer rejected.');
  } catch (error) {
    console.error('Reject transfer error:', error);
    sendError(res, 'Failed to reject transfer.');
  }
};

/**
 * GET /api/allocation/history
 */
export const getAllocationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asset_id, employee_id } = req.query;

    let query = `
      SELECT aa.*, a.name as asset_name, a.asset_tag,
             u.name as employee_name, u.email as employee_email,
             ab.name as allocated_by_name
      FROM asset_allocations aa
      LEFT JOIN assets a ON aa.asset_id = a.id
      LEFT JOIN users u ON aa.employee_id = u.id
      LEFT JOIN users ab ON aa.allocated_by = ab.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (asset_id) {
      query += ` AND aa.asset_id = $${paramIndex++}`;
      params.push(asset_id);
    }
    if (employee_id) {
      query += ` AND aa.employee_id = $${paramIndex++}`;
      params.push(employee_id);
    }

    query += ' ORDER BY aa.allocation_date DESC';

    const result = await pool.query(query, params);
    sendSuccess(res, result.rows, 'Allocation history fetched successfully.');
  } catch (error) {
    console.error('Allocation history error:', error);
    sendError(res, 'Failed to fetch allocation history.');
  }
};

/**
 * GET /api/allocation/transfers
 */
export const getTransferRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    let query = `
      SELECT tr.*, a.name as asset_name, a.asset_tag,
             fe.name as from_employee_name, te.name as to_employee_name,
             rb.name as requested_by_name, ab.name as approved_by_name
      FROM transfer_requests tr
      LEFT JOIN assets a ON tr.asset_id = a.id
      LEFT JOIN users fe ON tr.from_employee = fe.id
      LEFT JOIN users te ON tr.to_employee = te.id
      LEFT JOIN users rb ON tr.requested_by = rb.id
      LEFT JOIN users ab ON tr.approved_by = ab.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status) {
      query += ` AND tr.status = $1`;
      params.push(status);
    }

    query += ' ORDER BY tr.created_at DESC';

    const result = await pool.query(query, params);
    sendSuccess(res, result.rows, 'Transfer requests fetched successfully.');
  } catch (error) {
    console.error('Get transfers error:', error);
    sendError(res, 'Failed to fetch transfer requests.');
  }
};
