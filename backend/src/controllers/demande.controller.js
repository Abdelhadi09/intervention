const demandeService = require("../services/demande.service");
  // Hardcode first user for testing

// POST /api/v1/demandes
async function createDemande(req, res) {
  try {
    const { structure_id, nature_id, description } = req.body;
    // const created_by = req.user.user_id; // from JWT middleware
const created_by = 1; // Hardcode first user for testing
console.log("Creating demande for user_id:", created_by);
    const demande_id = await demandeService.createDemande({ created_by, structure_id, nature_id, description });
    res.status(201).json({ message: "Demande created", demande_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create demande" });
  }
}

// GET /api/v1/demandes/my
async function getMyDemandes(req, res) {
  try {
    const user_id = 1;
    

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
    const user_id = 1;
    const demande_id = parseInt(req.params.id);
   

    const demande = await demandeService.getDemandeById(demande_id, user_id);

    if (!demande) return res.status(404).json({ message: "Demande not found" });

    res.status(200).json(demande);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch demande" });
  }
}

module.exports = {
  createDemande,
  getMyDemandes,
  getDemandeById
};
