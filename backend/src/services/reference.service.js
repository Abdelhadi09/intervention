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

async function getAllIntervenants() {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT FULL_NAME
       FROM USERS
       WHERE ROLE = 'INTERVENANT'
       ORDER BY FULL_NAME`
    );

    return result.rows;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function getSousTypesByType(type) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT libelle
       FROM "SOUS_TYPE_EQUIPEMENT"
       WHERE type_id = :type
       ORDER BY libelle ASC`,
      { type }
    );

    return result.rows;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function getEquipementTypes() {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
  `SELECT libelle ,type_id
   FROM "TYPE_EQUIPEMENT"
   ORDER BY libelle ,type_id ASC`
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
  getAllNatures,
  getAllIntervenants,
  getSousTypesByType,
  getEquipementTypes
};

