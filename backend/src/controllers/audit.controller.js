const pool = require('../db/pool');

/**
 * GET /api/audit
 * Récupère les logs d'audit avec pagination
 */
async function getAuditLogs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(`
      SELECT a.id, a.action, a.entity, a.entity_id, a.details, a.created_at,
             u.full_name as user_name, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM audit_logs');

    res.json({
      total: parseInt(countResult.rows[0].count),
      logs: result.rows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs
};
