const { getConnection } = require("../config/db");

// Get all demandes (with optional filters)
async function getAllDemandes({ status, structure_id }) {
  let connection;
  try {
    connection = await getConnection();

    let query = `
      SELECT d.demande_id, d.description, d.status, d.created_at,
             u.full_name AS created_by, s.structure_name, n.nature_name
      FROM demandes d
      JOIN users u ON d.created_by = u.user_id
      JOIN structures s ON d.structure_id = s.structure_id
      JOIN natures n ON d.nature_id = n.nature_id
      WHERE 1=1
    `;

    const binds = {};

    if (status) {
      query += " AND d.status = :status";
      binds.status = status;
    }

    if (structure_id) {
      query += " AND d.structure_id = :structure_id";
      binds.structure_id = structure_id;
    }

    query += " ORDER BY d.created_at DESC";

    const result = await connection.execute(query, binds);
    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
}

// Update demande status
async function updateDemandeStatus(demande_id, new_status) {
  let connection;
  try {
    connection = await getConnection();

    // Only allow valid transitions
    const result = await connection.execute(
      `UPDATE demandes
       SET status = :status, updated_at = SYSDATE
       WHERE demande_id = :demande_id
       RETURNING demande_id INTO :id`,
      { status: new_status, demande_id, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}

// Get demande details including intervention
async function getDemandeDetails(demande_id) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT d.demande_id, d.description, d.status, d.created_at,
              u.full_name AS created_by, s.structure_name, n.nature_name,
              i.intervention_id, i.intervenant_id, i.travaux_effectues, i.date_intervention, i.closed_at
       FROM demandes d
       JOIN users u ON d.created_by = u.user_id
       JOIN structures s ON d.structure_id = s.structure_id
       JOIN natures n ON d.nature_id = n.nature_id
       LEFT JOIN interventions i ON d.demande_id = i.demande_id
       WHERE d.demande_id = :demande_id`,
      { demande_id }
    );

    return result.rows[0];
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getAllDemandes,
  updateDemandeStatus,
  getDemandeDetails
};
