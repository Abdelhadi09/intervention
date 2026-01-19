import api from "../../shared/api/axios";

export async function startIntervention(demandeId, intervenantId) {
  return api.post(`/it/interventions`, {
    demandeId,
    intervenantId
  });
}

export async function changeDemandeStatus(demandeId, status) {
  return api.put(`/demandes/${demandeId}/status`, { status });
}

export async function closeDemande(demandeId) {
  return api.put(`/demandes/${demandeId}/close`);
}
