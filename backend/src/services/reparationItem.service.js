const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function addReparationItem(demandeId, item) {
  const conn = await getConnection();

  await conn.execute(
    `INSERT INTO demande_reparation_item 
     (demande_id, designation, equipment_code, cout, problem)
     VALUES (:id, :designation, :code, :cout, :problem)`,
    {
      id: demandeId,
      designation: item.designation,
      code: item.equipment_code,
      cout: item.cout,
      problem: item.problem
    }
  );

  await conn.commit();
  await conn.close();

  return { message: "Item added" };
}

async function getReparationItems(demandeId) {
  const conn = await getConnection();

  const result = await conn.execute(
    `SELECT * FROM demande_reparation_item WHERE demande_id = :id`,
    [demandeId]
  );

  await conn.close();
  return result.rows;
}

// async function getReparationItems() {
//   const conn = await getConnection();

//   const result = await conn.execute(`SELECT * FROM demande_reparation_item`);

//   await conn.close();
//   return result.rows;
// }   


module.exports = { addReparationItem, getReparationItems };