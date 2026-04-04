const itDemandeService = require("../services/itDemande.service");
const interventionService = require("../services/intervention.service");
const reparationService = require("../services/reparation.service");
const reparationItemService = require("../services/reparationItem.service");
const prestataireService = require("../services/prestataire.service");
const receptionService = require("../services/reception.service");

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
 console.log("Fetched demande details for id", demande_id, ":", demande);
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

// Other functions for reparations, prestataires, receptions would go here...

// GET /api/v1/it/reparations
async function getAllReparations(req, res) {
  try {
    const reparations = await reparationService.getAllReparations();
    res.status(200).json(reparations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reparations" });
  }
}

// GET /api/v1/it/reparations/:demandeId
async function getReparationByDemandeId(req, res) {
  try {
    const demandeId = parseInt(req.params.demandeId);
    const reparation = await reparationService.getReparationByDemandeId(demandeId);

    if (!reparation) return res.status(404).json({ message: "Reparation not found for this demande" });

    res.status(200).json(reparation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reparation details" });
  }
}

// POST /api/v1/it/reparations
async function createReparation(req, res) {
  try {
    const reparationData = req.body;
    console.log("Creating reparation with data", reparationData);
    await reparationService.createReparation(reparationData);
    res.status(201).json({ message: "Reparation created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create reparation" });
  }
}

// POST /api/v1/it/reparations/:demandeId/items
async function addReparationItem(req, res) {
  try {
    const demandeId = parseInt(req.params.demandeId);
    const itemData = req.body;
    console.log("Adding reparation item for demande", demandeId, "with data", itemData);

    await reparationItemService.addReparationItem(demandeId, itemData);
    res.status(201).json({ message: "Reparation item added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add reparation item" });
  }
}

// GET /api/v1/it/reparations/:demandeId/items
async function getReparationItems(req, res) {
  try {
    const demandeId = parseInt(req.params.demandeId);
    const items = await reparationItemService.getReparationItems(demandeId);
    console.log("Fetched reparation items for demande", demandeId, ":", items);
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reparation items" });
  }
}

// Functions for prestataires and receptions would be similar...  

// For example, to create a prestataire:
async function createPrestataire(req, res) {
  try {
    const prestataireData = req.body;
    await prestataireService.createPrestataire(prestataireData);
    res.status(201).json({ message: "Prestataire created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create prestataire" });
  }
}

// And to get all prestataires:
async function getAllPrestataires(req, res) {
  try {
    const prestataires = await prestataireService.getAllPrestataires();
    res.status(200).json(prestataires);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch prestataires" });
  }
}

// Similarly, to get a prestataire by ID:
async function getPrestataireById(req, res) {
  try {
    const prestataireId = parseInt(req.params.id);
    const prestataire = await prestataireService.getPrestataireById(prestataireId);

    if (!prestataire) return res.status(404).json({ message: "Prestataire not found" });

    res.status(200).json(prestataire);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch prestataire details" });
  }
}

// And to create a reception:
async function createReception(req, res) {
  try {
    const { demandeId } = req.body;
    const receptionData = req.body;
   
    await receptionService.createReception(demandeId, receptionData);
    res.status(201).json({ message: "Reception created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create reception" });
  }
}

// To get all receptions:
async function getAllReceptions(req, res) {
  try {
    const receptions = await receptionService.getAllReceptions();
    res.status(200).json(receptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch receptions" });
  }
}

// To get a reception by ID:
async function getReceptionById(req, res) {
  try {
    const receptionId = parseInt(req.params.id);
    const reception = await receptionService.getReceptionById(receptionId);

    if (!reception) return res.status(404).json({ message: "Reception not found" });

    res.status(200).json(reception);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reception details" });
  }
}



module.exports = {
  getAllDemandes,
  getDemandeDetails,
  updateDemandeStatus,
  createIntervention,
  updateIntervention,
  assignDemandeToIntervenant,
  createReparation,
  getAllReparations,
  getReparationByDemandeId,
  addReparationItem,
  getReparationItems,
  createPrestataire,
  getAllPrestataires,
  getPrestataireById,
  createReception,
  getAllReceptions,
  getReceptionById,
  getAllEquipementDemandes
};
