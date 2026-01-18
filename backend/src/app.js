const express = require("express");
const cors = require("cors");

const referenceRoutes = require("./routes/reference.routes");
const demandeRoutes = require("./routes/demande.routes");
const itRoutes = require("./routes/it.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

// API routes
app.use("/api/v1", referenceRoutes);
app.use("/api/v1/demandes", demandeRoutes);
app.use("/api/v1/it", itRoutes);

module.exports = app;
