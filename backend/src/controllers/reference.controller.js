const referenceService = require("../services/reference.service");

async function getStructures(req, res) {
  try {
    const structures = await referenceService.getAllStructures();
    res.status(200).json(structures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch structures" });
  }
}

async function getNatures(req, res) {
  try {
    const natures = await referenceService.getAllNatures();
    res.status(200).json(natures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch natures" });
  }
}

async function getIntervenants(req, res) {
  try {
    const intervenants = await referenceService.getAllIntervenants();
    res.status(200).json(intervenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch intervenants" });
  }
}

async function getSousTypesByType(req, res) {
  try {
    const type = req.params.type;
    const sousTypes = await referenceService.getSousTypesByType(type);
    res.status(200).json(sousTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sous-types" });
  }
}

async function getEquipementTypes(req, res) {
  try {
    const equipementTypes = await referenceService.getEquipementTypes();
    res.status(200).json(equipementTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch equipement types" });
  }
}

module.exports = {
  getStructures,
  getNatures,
  getIntervenants,
  getSousTypesByType,
  getEquipementTypes
};
