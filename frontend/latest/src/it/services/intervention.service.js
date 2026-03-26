import api from "../../shared/api/axios";

export async function startIntervention(demande_id, intervenant) {
  console.log("API call to start intervention for demande", demande_id , "with intervenant", intervenant);
  return api.post(`/it/interventions`, {
    demande_id,
    intervenant,
  });
}

export async function changeDemandeStatus(demande_id, status) {
  return api.patch(`/it/demandes/${demande_id}/status`, { status });
}

export async function closeDemande(demande_id) {
  return api.put(`/demandes/${demande_id}/close`);
}
