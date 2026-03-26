const express = require("express");
const router = express.Router();

const referenceController = require("../controllers/reference.controller");

// Reference APIs
router.get("/structures", referenceController.getStructures);
router.get("/natures", referenceController.getNatures);
router.get("/intervenants", referenceController.getIntervenants);
router.get("/sous-types/:type", referenceController.getSousTypesByType);
router.get("/equipement-types", referenceController.getEquipementTypes);
module.exports = router;
