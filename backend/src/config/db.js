const oracledb = require("oracledb");
require("dotenv").config();

// Recommended Oracle settings
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

async function initDB() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1
    });

    console.log("✅ Oracle DB pool created");
  } catch (err) {
    console.error("❌ Error creating Oracle pool", err);
    process.exit(1);
  }
}

async function closeDB() {
  try {
    await pool.close(10);
    console.log("🔌 Oracle DB pool closed");
  } catch (err) {
    console.error("Error closing Oracle pool", err);
  }
}

async function getConnection() {
  if (!pool) {
    throw new Error("Oracle pool not initialized");
  }
  return await pool.getConnection();
}

module.exports = {
  initDB,
  closeDB,
  getConnection
};
