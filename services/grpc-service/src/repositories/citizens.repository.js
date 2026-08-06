const { pool } = require('../db/pool');

async function findById(citizenId) {
  const result = await pool.query(
    `SELECT citizen_id, full_name, citizenship_no, district, province,
            phone_number, email, date_of_birth, created_at
     FROM citizens WHERE citizen_id = $1`,
    [citizenId]
  );
  return result.rows[0] || null;
}

async function findAll(limit, offset) {
  const result = await pool.query(
    `SELECT citizen_id, full_name, citizenship_no, district, province,
            phone_number, email, date_of_birth, created_at
     FROM citizens ORDER BY citizen_id LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

module.exports = { findById, findAll };