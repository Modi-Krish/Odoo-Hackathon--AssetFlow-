import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

/**
 * GET /api/notifications
 * Get current user's notifications
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user!.id]
    );

    // Return flat array — frontend service expects data to be the array directly
    sendSuccess(res, result.rows, 'Notifications fetched successfully.');
  } catch (error) {
    console.error('Get notifications error:', error);
    sendError(res, 'Failed to fetch notifications.');
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications SET read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Notification not found.', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Notification marked as read.');
  } catch (error) {
    console.error('Mark read error:', error);
    sendError(res, 'Failed to mark notification as read.');
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query(
      `UPDATE notifications SET read = true
       WHERE user_id = $1 AND read = false`,
      [req.user!.id]
    );

    sendSuccess(res, null, 'All notifications marked as read.');
  } catch (error) {
    console.error('Mark all read error:', error);
    sendError(res, 'Failed to mark notifications as read.');
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a notification — scoped to req.user.id to prevent IDOR
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Notification not found or access denied.', 404);
      return;
    }

    sendSuccess(res, null, 'Notification deleted successfully.');
  } catch (error) {
    console.error('Delete notification error:', error);
    sendError(res, 'Failed to delete notification.');
  }
};
