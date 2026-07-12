import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * POST /api/bookings
 * Create a new booking with overlap validation
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asset_id, start_time, end_time, purpose } = req.body;

    // Check asset exists and is bookable
    const asset = await pool.query('SELECT * FROM assets WHERE id = $1', [asset_id]);
    if (asset.rows.length === 0) {
      sendError(res, 'Asset not found.', 404);
      return;
    }

    if (!asset.rows[0].bookable) {
      sendError(res, 'This asset is not bookable.', 400);
      return;
    }

    // Validate times
    const start = new Date(start_time);
    const end = new Date(end_time);
    if (end <= start) {
      sendError(res, 'End time must be after start time.', 400);
      return;
    }

    // Check for overlapping bookings
    const overlap = await pool.query(
      `SELECT * FROM bookings
       WHERE asset_id = $1
       AND status IN ('upcoming', 'ongoing')
       AND start_time < $3
       AND end_time > $2`,
      [asset_id, start_time, end_time]
    );

    if (overlap.rows.length > 0) {
      sendError(res, 'Time slot conflicts with an existing booking.', 409);
      return;
    }

    const result = await pool.query(
      `INSERT INTO bookings (asset_id, booked_by, start_time, end_time, purpose)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [asset_id, req.user!.id, start_time, end_time, purpose || null]
    );

    // Notification
    await pool.query(
      `INSERT INTO notifications (title, description, user_id)
       VALUES ($1, $2, $3)`,
      ['Booking Confirmed', `Your booking for ${asset.rows[0].name} has been confirmed.`, req.user!.id]
    );

    sendCreated(res, result.rows[0], 'Booking created successfully.');
  } catch (error) {
    console.error('Create booking error:', error);
    sendError(res, 'Failed to create booking.');
  }
};

/**
 * GET /api/bookings
 */
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asset_id, status, user_id } = req.query;

    let query = `
      SELECT b.*, a.name as asset_name, a.asset_tag, u.name as booked_by_name
      FROM bookings b
      LEFT JOIN assets a ON b.asset_id = a.id
      LEFT JOIN users u ON b.booked_by = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (asset_id) {
      query += ` AND b.asset_id = $${paramIndex++}`;
      params.push(asset_id);
    }
    if (status) {
      query += ` AND b.status = $${paramIndex++}`;
      params.push(status);
    }
    if (user_id) {
      query += ` AND b.booked_by = $${paramIndex++}`;
      params.push(user_id);
    }

    query += ' ORDER BY b.start_time ASC';

    const result = await pool.query(query, params);
    sendSuccess(res, result.rows, 'Bookings fetched successfully.');
  } catch (error) {
    console.error('Get bookings error:', error);
    sendError(res, 'Failed to fetch bookings.');
  }
};

/**
 * PUT /api/bookings/:id
 * Reschedule a booking
 */
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { start_time, end_time, purpose, status } = req.body;

    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      sendError(res, 'Booking not found.', 404);
      return;
    }

    const current = existing.rows[0];

    // If rescheduling, check overlap
    const newStart = start_time || current.start_time;
    const newEnd = end_time || current.end_time;

    if (start_time || end_time) {
      const overlap = await pool.query(
        `SELECT * FROM bookings
         WHERE asset_id = $1
         AND id != $2
         AND status IN ('upcoming', 'ongoing')
         AND start_time < $4
         AND end_time > $3`,
        [current.asset_id, id, newStart, newEnd]
      );

      if (overlap.rows.length > 0) {
        sendError(res, 'Rescheduled time conflicts with an existing booking.', 409);
        return;
      }
    }

    const result = await pool.query(
      `UPDATE bookings
       SET start_time = $1, end_time = $2, purpose = $3, status = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [newStart, newEnd, purpose !== undefined ? purpose : current.purpose, status || current.status, id]
    );

    sendSuccess(res, result.rows[0], 'Booking updated successfully.');
  } catch (error) {
    console.error('Update booking error:', error);
    sendError(res, 'Failed to update booking.');
  }
};

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND status IN ('upcoming', 'ongoing')
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Active booking not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Booking cancelled successfully.');
  } catch (error) {
    console.error('Cancel booking error:', error);
    sendError(res, 'Failed to cancel booking.');
  }
};
