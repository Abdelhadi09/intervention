import api from "../../shared/api/axios";

export async function getAllDemandes(status = "") {
  const url = status ? `/it/demandes?status=${status}` : "/it/demandes";
  const response = await api.get(url);
  return response.data;
}

export async function getAllDemandesEquipement() {
  const response = await api.get("/it/equipement");
  return response.data;
}

export async function getDemandeDetails(id) {
  const response = await api.get(`/it/demandes/${id}`);
  return response.data;
}

export async function updateDemandeStatus(demandeId, status) {
  return api.patch(`/it/demandes/${demandeId}/status`, { status });
}

export async function getAllPrestataires() {
  const response = await api.get("/it/prestataires");
  return response.data;
}

export async function getPrestataireById(id) {
  const response = await api.get(`/it/prestataires/${id}`);
  return response.data;
}
export async function createPrestataire(data) {
  return api.post("/it/prestataires", data);
}

export async function getAllReparations() {
  const response = await api.get("/it/reparations");
  return response.data;
}

export async function getReparationByDemandeId(demandeId) {
  const response = await api.get(`/it/reparations/${demandeId}`);
  return response.data;
}

export async function createReparation(data) {
  return api.post("/it/reparations", data);
}

export async function addReparationItem(demandeId, item) {
  return api.post(`/it/reparations/${demandeId}/items`, item);
}

export async function getReparationItems(demandeId) {
  const response = await api.get(`/it/reparations/${demandeId}/items`);
  return response.data;
}

export async function createReception(data) {
  return api.post("/it/receptions", data);
}

export async function getAllReceptions() {
  const response = await api.get("/it/receptions");
  return response.data;
}

export async function getReceptionById(id) {
  const response = await api.get(`/it/receptions/${id}`);
  return response.data;
}