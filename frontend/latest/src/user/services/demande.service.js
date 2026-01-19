import api from "../../shared/api/axios";

export async function getMyDemandes() {
  const response = await api.get("/demandes/my");
  return response.data;
}


export async function createDemande(demande) {
  const response = await api.post("/demandes", demande);
  return response.data;
}

export async function getDemandeById(id) {
  const response = await api.get(`/demandes/${id}`);
  return response.data;
}
