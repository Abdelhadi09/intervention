const demandeService = require("../services/demande.service");
  // Hardcode first user for testing

// POST /api/v1/demandes
async function createDemande(req, res) {
  try {
    const { structure_id, nature_id, description } = req.body;
     const created_by = req.user.user_id; // from JWT middleware
// const created_by = 1; // Hardcode first user for testing
console.log("Creating demande for user_id:", created_by);
    const demande_id = await demandeService.createDemande({ created_by, structure_id, nature_id, description });
    res.status(201).json({ message: "Demande created", demande_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create demande" });
  }
}

// POST /api/v1/demandes/intervention/:id/close
async function closeIntervention(req, res) {
  try {
    const intervention_id = parseInt(req.params.id);
console.log("Closing intervention with id", intervention_id);
    const demande_id = await demandeService.closeIntervention(intervention_id);
console.log("Intervention closed for demande_id", demande_id);
    res.status(200).json({ message: "Intervention closed", demande_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to close intervention" });
  }
}

// POST /api/v1/demandes/equipement
async function createDemandeEquipement(req, res) {
  try {
    const { type_equipement, sous_type, quantite,observation} = req.body;
     const created_by = req.user.user_id;
     console.log("Creating equipement demande for user_id:", created_by);
     console.log("Received data:", { type_equipement, sous_type, quantite, observation });
    const demande_id = await demandeService.createDemandeEquipement({  type_equipement, sous_type, quantite, observation ,created_by});
    res.status(201).json({ message: "Demande d'equipement created", demande_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create demande d'equipement" });
  }
}

// GET /api/v1/demandes
async function getmyDemandesEquipements(req, res) {
  try {
    const user_id = req.user.user_id;
    const demandes = await demandeService.getmyDemandesEquipements(user_id);
    res.status(200).json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch demandes" });
  }
}

// GET /api/v1/demandes/my
async function getMyDemandes(req, res) {
  try {
    const user_id = req.user.user_id;
    

    const demandes = await demandeService.getMyDemandes(user_id);
    res.status(200).json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch demandes" });
  }
}

// GET /api/v1/demandes/:id
async function getDemandeById(req, res) {
  try {
    const user_id = req.user.user_id;
    const demande_id = parseInt(req.params.id);
   

    const demande = await demandeService.getDemandeById(demande_id, user_id);

    if (!demande) return res.status(404).json({ message: "Demande not found" });

    res.status(200).json(demande);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch demande" });
  }
}

// put /api/v1/demandes/:id/remarque
async function addRemarque(req, res) {
  try {
    const user_id = req.user.user_id;
    const demande_id = parseInt(req.params.id);
    const { remarque } = req.body;

    await demandeService.addRemarque(demande_id, remarque);

    res.status(200).json({ message: "Remarque added", demande_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add remarque" });
  }
}

module.exports = {
  createDemande,
  createDemandeEquipement,
  getMyDemandes,
    getmyDemandesEquipements,
    closeIntervention,
    addRemarque,
  getDemandeById
};
