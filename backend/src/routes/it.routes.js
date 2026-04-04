const express = require("express");
const router = express.Router();
const itController = require("../controllers/it.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { route } = require("./demande.routes");

// Protect all IT routes
router.use(authMiddleware);
router.use(authorizeRoles("IT_ADMIN"));

// Demandes
router.get("/demandes", itController.getAllDemandes);
router.get("/equipement", itController.getAllEquipementDemandes);
router.get("/demandes/:id", itController.getDemandeDetails);
router.patch("/demandes/:id/status", itController.updateDemandeStatus);

// Interventions
router.post("/interventions", itController.assignDemandeToIntervenant);
router.put("/interventions/:id", itController.updateIntervention);
 
// reparations
router.post("/reparations", itController.createReparation);
router.get("/reparations", itController.getAllReparations);
router.get("/reparations/:demandeId", itController.getReparationByDemandeId);

router.post("/reparations/:demandeId/items", itController.addReparationItem);
router.get("/reparations/:demandeId/items", itController.getReparationItems);

// Prestataires
router.post("/prestataires", itController.createPrestataire);
router.get("/prestataires", itController.getAllPrestataires);
router.get("/prestataires/:id", itController.getPrestataireById);

// Receptions
router.post("/receptions", itController.createReception);
router.get("/receptions", itController.getAllReceptions);
router.get("/receptions/:id", itController.getReceptionById);

module.exports = router;
