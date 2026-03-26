const { getConnection } = require("../config/db");
const oracledb = require("oracledb");
// Create intervention
async function createIntervention({ demande_id, intervenant_id, travaux_effectues, date_intervention }) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO interventions (demande_id, intervenant_id, travaux_effectues, date_intervention)
       VALUES (:demande_id, :intervenant_id, :travaux_effectues, :date_intervention)
       RETURNING intervention_id INTO :id`,
      {
        demande_id,
        intervenant_id,
        travaux_effectues,
        date_intervention,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}

//asign demande to intervenant 

async function assignDemandeToIntervenant(demande_id, intervenant) {
  let connection;
  try {
    connection = await getConnection();

    await connection.execute(
      `UPDATE demandes
       SET intervenant = :intervenant, updated_at = SYSDATE
       WHERE demande_id = :demande_id`,
      { demande_id, intervenant }
      
    );
    console.log("Assigned demande", demande_id, "to intervenant", intervenant );
  } finally {
    if (connection) await connection.close();
  }
}

// Update intervention
async function updateIntervention(intervention_id, data) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE interventions
       SET travaux_effectues = :travaux_effectues,
           date_intervention = :date_intervention
       WHERE intervention_id = :intervention_id
       RETURNING intervention_id INTO :id`,
      {
        travaux_effectues: data.travaux_effectues,
        date_intervention: data.date_intervention,
        intervention_id,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}



module.exports = {
  createIntervention,
  updateIntervention,
  assignDemandeToIntervenant,
};
