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

// Create a new demande d'equipement
async function createDemandeEquipement({  type_equipement, sous_type, quantite, observation ,created_by}) {
  console.log("Creating equipement demande with data:", { type_equipement, sous_type, quantite, observation, created_by });
  let connection;
  try {
    connection = await getConnection();

    // Ensure sequence exists for equipement_demande.demande_id
    const seqName = "EQUIPEMENT_DEMANDE_SEQ";
    try {
      const seqCheck = await connection.execute(
        `SELECT COUNT(*) AS CNT FROM USER_SEQUENCES WHERE SEQUENCE_NAME = :name`,
        { name: seqName }
      );

      if (seqCheck.rows[0].CNT === 0) {
        const maxRes = await connection.execute(
          `SELECT NVL(MAX(demande_id), 0) AS MAXID FROM equipement_demande`
        );
        const start = (maxRes.rows[0].MAXID || 0) + 1;
        console.log(`Creating sequence ${seqName} starting at ${start}`);
        await connection.execute(`CREATE SEQUENCE ${seqName} START WITH ${start} INCREMENT BY 1`);
      }
    } catch (err) {
      console.error("Sequence check/create failed:", err.message || err);
      // proceed — the INSERT will fail if sequence doesn't exist or cannot be used
    }

    const result = await connection.execute(
      `INSERT INTO equipement_demande (demande_id, type_equipement, sous_type, quantite, observation, created_by)
       VALUES (${seqName}.NEXTVAL, :type_equipement, :sous_type, :quantite, :observation, :created_by)
       RETURNING demande_id INTO :id`,
      {
        type_equipement,
        sous_type,
        quantite,
        observation,
        created_by,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}

// Close intervention (and demande)
async function closeIntervention(demande_id) {
  let connection;
  try {
    connection = await getConnection();

    // // Update intervention
    // await connection.execute(
    //   `UPDATE interventions
    //    SET closed_at = SYSDATE
    //    WHERE intervention_id = :intervention_id`,
    //   { intervention_id }
    // );

    // // Get the demande_id
    // const result = await connection.execute(
    //   `SELECT demande_id FROM interventions WHERE intervention_id = :intervention_id`,
    //   { intervention_id }
    // );
    // console.log("Fetched demande_id for intervention", intervention_id, ":", result.rows[0]);

    // const demande_id = result.rows[0].DEMANDE_ID;

    // Update demande status to COMPLETED
    await connection.execute(
      `UPDATE demandes
       SET status = 'COMPLETED', updated_at = SYSDATE , remarque = ''
       WHERE demande_id = :demande_id`,
      { demande_id }
    );

    return demande_id;
  } finally {
    if (connection) await connection.close();
  }
}

// Get all demandes d'equipements
async function getmyDemandesEquipements(user_id) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT ed.demande_id, ed.type_equipement, ed.sous_type, ed.quantite, ed.observation, ed.created_at,
              u.username AS created_by
       FROM equipement_demande ed
       JOIN users u ON ed.created_by = u.user_id
       WHERE ed.created_by = :user_id
       ORDER BY ed.created_at DESC`,
      { user_id }

    );

    return result.rows;
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
              s.structure_name, n.nature_name , d.remarque
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

// Add remarque to demande
async function addRemarque(demande_id, remarque) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE demandes
       SET remarque = :remarque, updated_at = SYSDATE
       WHERE demande_id = :demande_id`,
      { remarque, demande_id }
    );

    return demande_id;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  createDemande,
  createDemandeEquipement,
  getMyDemandes,
    getmyDemandesEquipements,
      closeIntervention,
    addRemarque,
  getDemandeById
};
