const app = require("./src/app");
const { initDB, closeDB } = require("./src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    async function shutdown() {
      console.log("🛑 Shutting down server...");
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error("❌ Failed to start server", err);
  }
}

startServer();
