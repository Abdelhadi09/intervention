const express = require("express");
const router = express.Router();
const demandeController = require("../controllers/demande.controller");
const authMiddleware = require("../middlewares/auth.middleware");
// For now, assume auth middleware sets req.user
// router.use(authMiddleware);

router.post("/",authMiddleware, demandeController.createDemande);
router.get("/my",authMiddleware, demandeController.getMyDemandes);
router.get("/:id",authMiddleware, demandeController.getDemandeById);

module.exports = router;
