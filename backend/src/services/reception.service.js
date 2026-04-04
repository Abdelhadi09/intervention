const { getConnection } = require("../config/db");

async function createReception(demandeId, data) {
  const conn = await getConnection();

  try {
    // // 🚨 RULE 1: Check prestataire exists
    // const check = await conn.execute(
    //   `SELECT prestataire_id 
    //    FROM demande_reparation 
    //    WHERE demande_id = :id`,
    //   [demandeId]
    // );

    // if (!check.rows[0] || !check.rows[0][0]) {
    //   throw new Error("Prestataire must be assigned before reception");
    // }

    // 🚨 RULE 2: Check if already exists (immutable)
    const existing = await conn.execute(
      `SELECT * FROM reception_reparation WHERE demande_id = :id`,
      [demandeId]
    );

    if (existing.rows.length > 0) {
      throw new Error("Reception already validated (immutable)");
    }

    // Compute total cost from demande items
    const sumResult = await conn.execute(
      `SELECT NVL(SUM(cout), 0) AS total FROM demande_reparation_item WHERE demande_id = :id`,
      [demandeId]
    );
console.log("Fetched sum of item costs for demande", demandeId, ":", sumResult.rows);
    const totalCost =
      sumResult && sumResult.rows && sumResult.rows[0]
        ? Number(sumResult.rows[0]['TOTAL']) || 0
        : 0;
console.log("Computed total cost for demande", demandeId, ":", totalCost);
    // INSERT using computed total cost
    await conn.execute(
      `INSERT INTO reception_reparation
       (demande_id, cost_da, repair_duration_days, is_conform, observation, reception_date)
       VALUES (:id, :cost, :days, :conf, :obs, SYSDATE)`,
      {
        id: demandeId,
        cost: totalCost,
        days: data.repair_duration_days,
        conf: data.is_conform,
        obs: data.observation
      }
    );

    await conn.commit();
    return { message: "Reception saved" };

  } finally {
    await conn.close();
  }
}

async function getReceptionById(demandeId) {
  const conn = await getConnection();

  const result = await conn.execute(
    `SELECT * FROM reception_reparation WHERE demande_id = :id`,
    [demandeId]
  );

  await conn.close();
  return result.rows[0];
}

async function getAllReceptions() {
  const conn = await getConnection();

  const result = await conn.execute(`
    SELECT r.*, d.structure_id, dr.expediteur_name, p.name AS prestataire
    FROM reception_reparation r
    JOIN demande_reparation dr ON r.demande_id = dr.demande_id
    JOIN demandes d ON r.demande_id = d.demande_id
    LEFT JOIN prestataire p ON dr.prestataire_id = p.prestataire_id
  `);

  await conn.close();
  return result.rows;
}

module.exports = { createReception, getReceptionById, getAllReceptions };
