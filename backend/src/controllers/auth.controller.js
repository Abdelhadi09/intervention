const jwt = require("jsonwebtoken");
require("dotenv").config();
const authService = require("../services/auth.service");

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await authService.login(username, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
}

module.exports = { login };
