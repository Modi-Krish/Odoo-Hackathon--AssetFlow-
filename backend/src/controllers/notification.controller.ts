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

    const unreadCount = await pool.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND read = false`,
      [req.user!.id]
    );

    sendSuccess(res, {
      notifications: result.rows,
      unread_count: parseInt(unreadCount.rows[0].count),
    }, 'Notifications fetched successfully.');
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
 * PUT /api/notifications/read-all
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
