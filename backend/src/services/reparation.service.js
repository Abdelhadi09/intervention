const { getConnection } = require("../config/db");

// CREATE DEMANDE REPARATION
async function createReparation(data) {
  const conn = await getConnection();

  try {
    // // 1. Insert into demandes (base table)
    // await conn.execute(
    //   `INSERT INTO demandes (demande_id, date_demande, structure, type, destination)
    //    VALUES (:id, SYSDATE, :structure, 'REPARATION', 'EXTERNE')`,
    //   [data.id, data.structure]
    // );

    // 2. Insert into demande_reparation (prestataire optional)
    await conn.execute(
      `INSERT INTO demande_reparation (demande_id, prestataire_id, expediteur_name)
       VALUES (:id, :prestataire_id, :expediteur_name)`,
      {
        id: data.id,
        prestataire_id: data.prestataire_id || null,
        expediteur_name: data.expediteur_name
      }
    );

    await conn.commit();
    return { message: "Reparation created" };

  } finally {
    await conn.close();
  }
}

// GET ALL
async function getAllReparations() {
  const conn = await getConnection();

  const result = await conn.execute(`
    SELECT d.demande_id, d.structure_id, dr.expediteur_name, p.name AS prestataire , r.reception_id
    FROM demandes d
    JOIN demande_reparation dr ON d.demande_id = dr.demande_id
    LEFT JOIN prestataire p ON dr.prestataire_id = p.prestataire_id
    LEFT JOIN reception_reparation r ON d.demande_id = r.demande_id
  `);

  await conn.close();
  return result.rows;
}

// GET BY ID
async function getReparationByDemandeId(id) {
  const conn = await getConnection();

  const result = await conn.execute(
    `SELECT * FROM demande_reparation WHERE demande_id = :id`,
    [id]
  );

  await conn.close();
  return result.rows[0];
}

module.exports = {
  createReparation,
  getAllReparations,
  getReparationByDemandeId
};