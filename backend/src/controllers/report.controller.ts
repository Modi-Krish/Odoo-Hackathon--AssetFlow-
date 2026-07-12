import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

/**
 * GET /api/reports
 * Generate reports by type: asset, department, maintenance, allocation
 */
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;

    let data: unknown;

    switch (type) {
      case 'asset': {
        const result = await pool.query(`
          SELECT a.*, c.name as category_name,
                 (SELECT COUNT(*) FROM asset_allocations WHERE asset_id = a.id) as total_allocations,
                 (SELECT COUNT(*) FROM maintenance_requests WHERE asset_id = a.id) as total_maintenance,
                 (SELECT COUNT(*) FROM bookings WHERE asset_id = a.id) as total_bookings
          FROM assets a
          LEFT JOIN asset_categories c ON a.category_id = c.id
          ORDER BY a.created_at DESC
        `);

        const summary = await pool.query(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN status = 'allocated' THEN 1 ELSE 0 END) as allocated,
            SUM(CASE WHEN status = 'under_maintenance' THEN 1 ELSE 0 END) as under_maintenance,
            SUM(COALESCE(purchase_cost, 0)) as total_value
          FROM assets
        `);

        data = { assets: result.rows, summary: summary.rows[0] };
        break;
      }

      case 'department': {
        const result = await pool.query(`
          SELECT d.name as department,
                 COUNT(DISTINCT u.id) as employee_count,
                 COUNT(DISTINCT aa.asset_id) as allocated_assets,
                 u_head.name as department_head
          FROM departments d
          LEFT JOIN users u ON u.department_id = d.id
          LEFT JOIN asset_allocations aa ON aa.employee_id = u.id AND aa.returned = false
          LEFT JOIN users u_head ON d.head_id = u_head.id
          GROUP BY d.id, d.name, u_head.name
          ORDER BY d.name
        `);
        data = { departments: result.rows };
        break;
      }

      case 'maintenance': {
        const result = await pool.query(`
          SELECT mr.*, a.name as asset_name, a.asset_tag,
                 u.name as requested_by_name
          FROM maintenance_requests mr
          LEFT JOIN assets a ON mr.asset_id = a.id
          LEFT JOIN users u ON mr.requested_by = u.id
          ORDER BY mr.created_at DESC
        `);

        const summary = await pool.query(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
          FROM maintenance_requests
        `);

        data = { maintenance: result.rows, summary: summary.rows[0] };
        break;
      }

      case 'allocation': {
        const result = await pool.query(`
          SELECT aa.*, a.name as asset_name, a.asset_tag,
                 u.name as employee_name, u.email as employee_email,
                 d.name as department_name
          FROM asset_allocations aa
          LEFT JOIN assets a ON aa.asset_id = a.id
          LEFT JOIN users u ON aa.employee_id = u.id
          LEFT JOIN departments d ON u.department_id = d.id
          ORDER BY aa.allocation_date DESC
        `);

        const summary = await pool.query(`
          SELECT
            COUNT(*) as total_allocations,
            SUM(CASE WHEN returned = false THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN returned = true THEN 1 ELSE 0 END) as returned,
            SUM(CASE WHEN returned = false AND expected_return < CURRENT_DATE THEN 1 ELSE 0 END) as overdue
          FROM asset_allocations
        `);

        data = { allocations: result.rows, summary: summary.rows[0] };
        break;
      }

      default:
        sendError(res, 'Invalid report type. Use: asset, department, maintenance, allocation', 400);
        return;
    }

    // Log the report generation
    await pool.query(
      `INSERT INTO reports (type, generated_by, filters)
       VALUES ($1, $2, $3)`,
      [type, req.user!.id, JSON.stringify(req.query)]
    );

    sendSuccess(res, data, `${type} report generated successfully.`);
  } catch (error) {
    console.error('Report error:', error);
    sendError(res, 'Failed to generate report.');
  }
};
