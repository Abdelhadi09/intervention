const express = require("express");
const router = express.Router();
const itController = require("../controllers/it.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

// Protect all IT routes
router.use(authMiddleware);
router.use(authorizeRoles("IT_ADMIN"));

// Demandes
router.get("/demandes", itController.getAllDemandes);
router.get("/demandes/:id", itController.getDemandeDetails);
router.patch("/demandes/:id/status", itController.updateDemandeStatus);

// Interventions
router.post("/interventions", itController.createIntervention);
router.put("/interventions/:id", itController.updateIntervention);
router.post("/interventions/:id/close", itController.closeIntervention);

module.exports = router;
