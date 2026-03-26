const express = require("express");
const router = express.Router();
const demandeController = require("../controllers/demande.controller");
const authMiddleware = require("../middlewares/auth.middleware");
// For now, assume auth middleware sets req.user
// router.use(authMiddleware);

router.post("/",authMiddleware, demandeController.createDemande);
router.post("/equipement",authMiddleware, demandeController.createDemandeEquipement);
router.get("/myequipement",authMiddleware, demandeController.getmyDemandesEquipements);
router.get("/my",authMiddleware, demandeController.getMyDemandes);
router.get("/:id",authMiddleware, demandeController.getDemandeById);
router.put("/intervention/:id/close", authMiddleware, demandeController.closeIntervention);
router.put("/:id/remarque", authMiddleware, demandeController.addRemarque);
module.exports = router;
