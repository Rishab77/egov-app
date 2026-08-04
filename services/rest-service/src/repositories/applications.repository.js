const { pool } = require('../db/pool');

async function findByCitizenId(citizenId) {
  const result = await pool.query(
    `SELECT application_id, citizen_id, service_name, status,
            submitted_at, last_updated_at, remarks
     FROM service_applications WHERE citizen_id = $1
     ORDER BY submitted_at DESC`,
    [citizenId]
  );
  return result.rows;
}

async function findById(applicationId) {
  const result = await pool.query(
    `SELECT application_id, citizen_id, service_name, status,
            submitted_at, last_updated_at, remarks
     FROM service_applications WHERE application_id = $1`,
    [applicationId]
  );
  return result.rows[0] || null;
}

module.exports = { findByCitizenId, findById };