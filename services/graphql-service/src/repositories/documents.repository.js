const { pool } = require('../db/pool');

async function findByCitizenId(citizenId, limit, offset) {
  const result = await pool.query(
    `SELECT document_id, citizen_id, application_id, document_type,
            file_name, file_size_bytes, uploaded_at
     FROM documents WHERE citizen_id = $1
     ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3`,
    [citizenId, limit, offset]
  );
  return result.rows;
}

module.exports = { findByCitizenId };