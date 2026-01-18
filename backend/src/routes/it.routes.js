const express = require("express");
const router = express.Router();
const itController = require("../controllers/it.controller");

// Demandes
router.get("/demandes", itController.getAllDemandes);
router.get("/demandes/:id", itController.getDemandeDetails);
router.patch("/demandes/:id/status", itController.updateDemandeStatus);

// Interventions
router.post("/interventions", itController.createIntervention);
router.put("/interventions/:id", itController.updateIntervention);
router.post("/interventions/:id/close", itController.closeIntervention);

module.exports = router;
