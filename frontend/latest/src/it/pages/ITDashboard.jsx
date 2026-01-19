import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllDemandes,
  updateDemandeStatus
} from "../services/itDemande.service";
import ConfirmModal from "../../shared/components/ConfirmModal";

export default function ITDashboard() {
  const [demandes, setDemandes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [nextStatus, setNextStatus] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadDemandes();
  }, [statusFilter]);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const data = await getAllDemandes(statusFilter);
      setDemandes(data);
    } catch {
      setError("Failed to load demandes");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Open confirmation modal
  const askStatusChange = (demande, status) => {
    setSelectedDemande(demande);
    setNextStatus(status);
    setConfirmOpen(true);
  };

  // 🔹 Confirm & call API
  const confirmStatusChange = async () => {
    try {
      await updateDemandeStatus(
        selectedDemande.DEMANDE_ID,
        nextStatus
      );
      setConfirmOpen(false);
      setSelectedDemande(null);
      setNextStatus("");
      loadDemandes();
    } catch {
      alert("Failed to update status");
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>IT Dashboard</h2>

      <div style={styles.filter}>
        <label>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="CREATED">CREATED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && demandes.length === 0 && <p>No demandes found</p>}

      {!loading && demandes.length > 0 && (
        
        <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Structure</th>
              <th>Nature</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr
                key={d.DEMANDE_ID}
                style={styles.row}
                onClick={() => navigate(`/it/demandes/${d.DEMANDE_ID}`)}
              >
                <td>{d.DEMANDE_ID}</td>
                <td>{d.STRUCTURE_NAME}</td>
                <td>{d.NATURE_NAME}</td>
                <td>
  <span style={{ ...styles.badge, ...statusStyle(d.STATUS) }}>
    {d.STATUS}
  </span>
</td>

                <td>{new Date(d.CREATED_AT).toLocaleDateString()}</td>
                <td>
                  {d.STATUS === "CREATED" && (
                    <button
                      style={styles.button}
                      onClick={(e) => {
                        e.stopPropagation();
                        askStatusChange(d, "IN_PROGRESS");
                      }}
                    >
                      Start
                    </button>
                  )}

                  {d.STATUS === "IN_PROGRESS" && (
                    <button
                      style={styles.button}
                      onClick={(e) => {
                        e.stopPropagation();
                        askStatusChange(d, "COMPLETED");
                      }}
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* 🔹 Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Status Change"
        message={`Change status to ${nextStatus}?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}

const styles = {

 container: {
  paddingTop: "0px",
    padding: "30px",
    background: "#f4f6f8",
    minHeight: "100vh"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  filter: {
    marginBottom: "20px"
  },
  table: {
    height: "30%",
    width: "100%",
    borderCollapse: "collapse",
    padding: "10px"
  },
  row: {
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    margin: "10px"
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600"
  },
  button: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500"
  },
  startBtn: {
    background: "#1976d2",
    color: "#fff"
  },
  closeBtn: {
    background: "#2e7d32",
    color: "#fff"
  },
  title: {
    marginTop: "0px",
    marginBottom: "20px" ,
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    cursor: "pointer",
    borderRadius: "4px"
  }
};
