const { getConnection } = require("../config/db");

async function getAllStructures() {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT structure_id, structure_name
       FROM structures
       WHERE is_active = 'Y'
       ORDER BY structure_name`
    );
    
    
    return result.rows;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function getAllNatures() {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT nature_id, nature_name
       FROM natures
       ORDER BY nature_name`
    );

    return result.rows;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getAllStructures,
  getAllNatures
};
