const express = require("express");
const router = express.Router();
const demandeController = require("../controllers/demande.controller");

// For now, assume auth middleware sets req.user
// router.use(authMiddleware);

router.post("/", demandeController.createDemande);
router.get("/my", demandeController.getMyDemandes);
router.get("/:id", demandeController.getDemandeById);

module.exports = router;
