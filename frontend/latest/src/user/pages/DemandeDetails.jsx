import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDemandeById } from "../services/demande.service";

export default function DemandeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDemande();
  }, []);

  const loadDemande = async () => {
    try {
      const data = await getDemandeById(id);
      setDemande(data);
    } catch {
      setError("Failed to load demande details");
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case "CREATED":
        return { background: "#e0e0e0", color: "#333" };
      case "IN_PROGRESS":
        return { background: "#fff3cd", color: "#856404" };
      case "COMPLETED":
        return { background: "#d4edda", color: "#155724" };
      default:
        return {};
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div style={styles.card}>
        <h2>Demande Details</h2>

        <div style={styles.row}>
          <span style={styles.label}>ID</span>
          <span>{demande.DEMANDE_ID}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Nature</span>
          <span>{demande.NATURE_NAME}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Structure</span>
          <span>{demande.STRUCTURE_NAME}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Status</span>
          <span style={{ ...styles.badge, ...statusStyle(demande.STATUS) }}>
            {demande.STATUS}
          </span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Created at</span>
          <span>
            {new Date(demande.CREATED_AT).toLocaleString()}
          </span>
        </div>

        <div style={styles.descriptionBox}>
          <span style={styles.label}>Description</span>
          <p>{demande.DESCRIPTION}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f4f6f8",
    minHeight: "100vh"
  },
  backBtn: {
    marginBottom: "15px",
    background: "transparent",
    border: "none",
    color: "#1976d2",
    cursor: "pointer",
    fontSize: "14px"
  },
  card: {
    background: "#fff",
    padding: "25px",
    maxWidth: "700px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee"
  },
  label: {
    fontWeight: "600",
    color: "#555"
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600"
  },
  descriptionBox: {
    marginTop: "15px",
    padding: "12px",
    background: "#fafafa",
    borderRadius: "6px"
  }
};
