const { getConnection } = require("../config/db");
const bcrypt = require("bcryptjs");

async function login(username, password) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT user_id, full_name, username, password, role
       FROM users
       WHERE username = :username`,
      { username }
    );

    if (result.rows.length === 0) {
      return null; // user not found
    }

    const user = result.rows[0];

    // Oracle returns object keys in uppercase
    const isMatch = bcrypt.compareSync(password, user.PASSWORD);
    if (!isMatch) return null;

    return {
      user_id: user.USER_ID,
      full_name: user.FULL_NAME,
      username: user.USERNAME,
      role: user.ROLE
    };
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { login };
