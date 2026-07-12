import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

/**
 * GET /api/dashboard
 * Returns all KPI data for the dashboard
 */
export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Total assets
    const totalAssets = await pool.query('SELECT COUNT(*) as count FROM assets');

    // Available assets
    const availableAssets = await pool.query(
      `SELECT COUNT(*) as count FROM assets WHERE status = 'available'`
    );

    // Allocated assets
    const allocatedAssets = await pool.query(
      `SELECT COUNT(*) as count FROM assets WHERE status = 'allocated'`
    );

    // Under maintenance assets
    const underMaintenance = await pool.query(
      `SELECT COUNT(*) as count FROM assets WHERE status = 'under_maintenance'`
    );

    // Pending maintenance requests
    const pendingMaintenance = await pool.query(
      `SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'pending'`
    );

    // Active bookings (upcoming or ongoing)
    const activeBookings = await pool.query(
      `SELECT COUNT(*) as count FROM bookings WHERE status IN ('upcoming', 'ongoing')`
    );

    // Pending transfers
    const pendingTransfers = await pool.query(
      `SELECT COUNT(*) as count FROM transfer_requests WHERE status = 'pending'`
    );

    // Overdue returns
    const overdueReturns = await pool.query(
      `SELECT COUNT(*) as count FROM asset_allocations
       WHERE returned = false AND expected_return < CURRENT_DATE`
    );

    // Recent activities (last 10 allocations, bookings, maintenance combined)
    const recentActivities = await pool.query(`
      (
        SELECT 'allocation' as type, 'Asset Allocated' as title,
               a.name || ' assigned to ' || u.name as description,
               aa.created_at
        FROM asset_allocations aa
        JOIN assets a ON aa.asset_id = a.id
        JOIN users u ON aa.employee_id = u.id
        ORDER BY aa.created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'maintenance' as type, 'Maintenance Request' as title,
               a.name || ': ' || mr.issue as description,
               mr.created_at
        FROM maintenance_requests mr
        JOIN assets a ON mr.asset_id = a.id
        ORDER BY mr.created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'booking' as type, 'Resource Booked' as title,
               a.name || ' booked by ' || u.name as description,
               b.created_at
        FROM bookings b
        JOIN assets a ON b.asset_id = a.id
        JOIN users u ON b.booked_by = u.id
        ORDER BY b.created_at DESC
        LIMIT 5
      )
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Assets by category
    const assetsByCategory = await pool.query(`
      SELECT c.name as category, COUNT(a.id) as count
      FROM asset_categories c
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `);

    // Assets by status
    const assetsByStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM assets
      GROUP BY status
      ORDER BY count DESC
    `);

    sendSuccess(res, {
      kpis: {
        total_assets: parseInt(totalAssets.rows[0].count),
        available_assets: parseInt(availableAssets.rows[0].count),
        allocated_assets: parseInt(allocatedAssets.rows[0].count),
        under_maintenance: parseInt(underMaintenance.rows[0].count),
        pending_maintenance: parseInt(pendingMaintenance.rows[0].count),
        active_bookings: parseInt(activeBookings.rows[0].count),
        pending_transfers: parseInt(pendingTransfers.rows[0].count),
        overdue_returns: parseInt(overdueReturns.rows[0].count),
      },
      recent_activities: recentActivities.rows,
      assets_by_category: assetsByCategory.rows,
      assets_by_status: assetsByStatus.rows,
    }, 'Dashboard data fetched successfully.');
  } catch (error) {
    console.error('Dashboard error:', error);
    sendError(res, 'Failed to fetch dashboard data.');
  }
};
