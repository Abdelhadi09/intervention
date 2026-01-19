import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDemandeDetails } from "../services/itDemande.service";
import {
  startIntervention,
  changeDemandeStatus,
  closeDemande
} from "../services/intervention.service";

export default function ITDemandeDetails() {
  const { id } = useParams();

  const [demande, setDemande] = useState(null);
  const [intervenantId, setIntervenantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDemande();
  }, []);

  const loadDemande = async () => {
    try {
      const data = await getDemandeDetails(id);
      setDemande(data);
    } catch (err) {
      setError("Failed to load demande details");
    } finally {
      setLoading(false);
    }
  };

  const handleStartIntervention = async () => {
    if (!intervenantId) return alert("Select an intervenant");

    try {
      await startIntervention(demande.DEMANDE_ID, intervenantId);
      await changeDemandeStatus(demande.DEMANDE_ID, "IN_PROGRESS");
      loadDemande();
    } catch {
      alert("Failed to start intervention");
    }
  };

  const handleCloseDemande = async () => {
    if (!window.confirm("Close this demande?")) return;

    try {
      await closeDemande(demande.DEMANDE_ID);
      loadDemande();
    } catch {
      alert("Failed to close demande");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!demande) return null;

  return (
    <div style={styles.container}>
      <h2>Demande #{demande.DEMANDE_ID}</h2>

      <div style={styles.block}>
        <p><b>Structure:</b> {demande.STRUCTURE_NAME}</p>
        <p><b>Nature:</b> {demande.NATURE_NAME}</p>
        <p><b>Description:</b> {demande.DESCRIPTION}</p>
        <p><b>Status:</b> {demande.STATUS}</p>
        <p><b>Created:</b> {new Date(demande.CREATED_AT).toLocaleString()}</p>
      </div>

      {demande.STATUS === "NEW" && (
        <div style={styles.actions}>
          <h4>Start Intervention</h4>

          <input
            type="text"
            placeholder="Intervenant ID"
            value={intervenantId}
            onChange={(e) => setIntervenantId(e.target.value)}
          />

          <button onClick={handleStartIntervention}>
            Assign & Start
          </button>
        </div>
      )}

      {demande.STATUS === "IN_PROGRESS" && (
        <div style={styles.actions}>
          <button onClick={handleCloseDemande}>
            Close Demande
          </button>
        </div>
      )}
    </div>
  );
}
const styles = {
  container: {
    padding: "20px",
    maxWidth: "700px"
  },
  block: {
    background: "#f5f5f5",
    padding: "15px",
    marginBottom: "20px"
  },
  actions: {
    marginTop: "20px"
  }
};
