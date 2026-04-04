const { getConnection } = require("../config/db");

async function createPrestataire(data) {
  const conn = await getConnection();

  await conn.execute(
    `INSERT INTO prestataire (name, phone, email)
     VALUES (:name, :phone, :email)`,
    data
  );

  await conn.commit();
  await conn.close();

  return { message: "Prestataire created" };
}

async function getAllPrestataires() {
  const conn = await getConnection();

  const result = await conn.execute(`SELECT * FROM prestataire`);

  await conn.close();
  return result.rows;
}
async function getPrestataireById(id) {
  const conn = await getConnection();

  const result = await conn.execute(
    `SELECT * FROM prestataire WHERE prestataire_id = :id`,
    [id]
  );

  await conn.close();
  return result.rows[0];
}

module.exports = { createPrestataire, getAllPrestataires, getPrestataireById };

