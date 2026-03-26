const itDemandeService = require("../services/itDemande.service");
const interventionService = require("../services/intervention.service");

// GET /api/v1/it/demandes
async function getAllDemandes(req, res) {
  try {
    const { status, structure_id } = req.query;
    const demandes = await itDemandeService.getAllDemandes({ status, structure_id });
    res.status(200).json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch demandes" });
  }
}

// GET /api/v1/it/demandes/:id
async function getDemandeDetails(req, res) {
  try {
    const demande_id = parseInt(req.params.id);
    const demande = await itDemandeService.getDemandeDetails(demande_id);

    if (!demande) return res.status(404).json({ message: "Demande not found" });

    res.status(200).json(demande);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch demande details" });
  }
}

// PATCH /api/v1/it/demandes/:id/status
async function updateDemandeStatus(req, res) {
  try {
    const demande_id = parseInt(req.params.id);
    const { status } = req.body;

    const id = await itDemandeService.updateDemandeStatus(demande_id, status);

    res.status(200).json({ message: "Status updated", demande_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
}

// POST /api/v1/it/interventions
async function createIntervention(req, res) {
  try {
    const { demande_id, intervenant_id, travaux_effectues, date_intervention } = req.body;
console.log("Creating intervention for demande", demande_id , "with intervenant", intervenant_id , "and travaux", travaux_effectues , "on date", date_intervention);
    const intervention_id = await interventionService.createIntervention({
      demande_id,
      intervenant_id,
      travaux_effectues,
      date_intervention
    });

    res.status(201).json({ message: "Intervention created", intervention_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create intervention" });
  }
}

// post assign demande to intervenant
async function assignDemandeToIntervenant(req, res) {
  try {
    const { demande_id, intervenant } = req.body;
console.log("controller Assigning demande", demande_id , "to intervenant", intervenant);
    await interventionService.assignDemandeToIntervenant(demande_id, intervenant);

    res.status(200).json({ message: "Demande assigned to intervenant" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign demande to intervenant" });
  }
}

// PUT /api/v1/it/interventions/:id
async function updateIntervention(req, res) {
  try {
    const intervention_id = parseInt(req.params.id);
    const { travaux_effectues, date_intervention } = req.body;

    const id = await interventionService.updateIntervention(intervention_id, { travaux_effectues, date_intervention });
    res.status(200).json({ message: "Intervention updated", intervention_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update intervention" });
  }
}



// GET /api/v1/it/equipement
async function getAllEquipementDemandes(req, res) {
  try {
    const demandes = await itDemandeService.getAllEquipementDemandes();
    res.status(200).json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch equipement demandes" });
  }
}

module.exports = {
  getAllDemandes,
  getDemandeDetails,
  updateDemandeStatus,
  createIntervention,
  updateIntervention,
  assignDemandeToIntervenant,
  getAllEquipementDemandes
};
