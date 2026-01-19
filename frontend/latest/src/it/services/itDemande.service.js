import api from "../../shared/api/axios";

export async function getAllDemandes(status = "") {
  const url = status ? `/it/demandes?status=${status}` : "/it/demandes";
  const response = await api.get(url);
  return response.data;
}

export async function getDemandeDetails(id) {
  const response = await api.get(`/it/demandes/${id}`);
  return response.data;
}

export async function updateDemandeStatus(demandeId, status) {
  return api.patch(`/it/demandes/${demandeId}/status`, { status });
}