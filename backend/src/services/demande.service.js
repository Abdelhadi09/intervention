const { getConnection } = require("../config/db");
const oracledb = require("oracledb");
// Create a new demande
async function createDemande({ created_by, structure_id, nature_id, description }) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO demandes (created_by, structure_id, nature_id, description)
       VALUES (:created_by, :structure_id, :nature_id, :description)
       RETURNING demande_id INTO :id`,
      {
        created_by,
        structure_id,
        nature_id,
        description,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}

// Get all demandes of a user
async function getMyDemandes(user_id) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT d.demande_id, n.nature_name, d.status, d.created_at
       FROM demandes d
       JOIN natures n ON d.nature_id = n.nature_id
       WHERE d.created_by = :user_id
       ORDER BY d.created_at DESC`,
      { user_id }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
}

// Get demande details
async function getDemandeById(demande_id, user_id) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT d.demande_id, d.description, d.status, d.created_at,
              s.structure_name, n.nature_name
       FROM demandes d
       JOIN structures s ON d.structure_id = s.structure_id
       JOIN natures n ON d.nature_id = n.nature_id
       WHERE d.demande_id = :demande_id AND d.created_by = :user_id`,
      { demande_id, user_id }
    );

    return result.rows[0];
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  createDemande,
  getMyDemandes,
  getDemandeById
};
