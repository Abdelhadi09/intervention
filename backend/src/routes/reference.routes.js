const express = require("express");
const router = express.Router();

const referenceController = require("../controllers/reference.controller");

// Reference APIs
router.get("/structures", referenceController.getStructures);
router.get("/natures", referenceController.getNatures);

module.exports = router;
