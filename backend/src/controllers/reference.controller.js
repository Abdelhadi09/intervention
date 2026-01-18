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

module.exports = {
  getStructures,
  getNatures
};
