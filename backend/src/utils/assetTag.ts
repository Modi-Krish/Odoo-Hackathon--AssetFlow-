import pool from '../config/db';

/**
 * Generate a unique asset tag in format AST-XXXXXX
 * Auto-increments based on the highest existing tag
 */
export const generateAssetTag = async (): Promise<string> => {
  const result = await pool.query(
    `SELECT asset_tag FROM assets ORDER BY asset_tag DESC LIMIT 1`
  );

  let nextNumber = 1;

  if (result.rows.length > 0) {
    const lastTag = result.rows[0].asset_tag; // e.g., AST-000005
    const lastNumber = parseInt(lastTag.split('-')[1], 10);
    nextNumber = lastNumber + 1;
  }

  return `AST-${nextNumber.toString().padStart(6, '0')}`;
};
