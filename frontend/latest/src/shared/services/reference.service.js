import api from "../api/axios";

export async function getStructures() {
  const response = await api.get("/structures");
  return response.data;
}

export async function getNatures() {
  const response = await api.get("/natures");
  return response.data;
}

export async function getAllIntervenant() {
  const response = await api.get("/intervenants");
  return response.data;
}

export async function getSousTypesByType(type) {
  const response = await api.get(`/sous-types/${type}`);
  return response.data;
}

export async function getEquipementTypes() {
  const response = await api.get("/equipement-types");
  return response.data;
}
