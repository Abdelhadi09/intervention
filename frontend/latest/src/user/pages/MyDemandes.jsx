import { useEffect, useState } from "react";
import { getMyDemandes } from "../services/demande.service";
import { useNavigate } from "react-router-dom";

export default function MyDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      const data = await getMyDemandes();
      setDemandes(data);
    } catch {
      setError("Failed to load demandes");
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

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h2>My Demandes</h2>

      <div style={styles.card}>
        <button
          style={styles.newButton}
          onClick={() => navigate("/user/demandes/new")}
        >
          + New Demande
        </button>

        {demandes.length === 0 ? (
          <p>No demandes found</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nature</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr
                  key={d.DEMANDE_ID}
                  style={styles.row}
                  onClick={() =>
                    navigate(`/user/demandes/${d.DEMANDE_ID}`)
                  }
                >
                  <td>{d.DEMANDE_ID}</td>
                  <td>{d.NATURE_NAME}</td>
                  <td>
                    <span
                      style={{
                        ...styles.badge,
                        ...statusStyle(d.STATUS)
                      }}
                    >
                      {d.STATUS}
                    </span>
                  </td>
                  <td>
                    {new Date(d.CREATED_AT).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  row: {
    cursor: "pointer",
    borderBottom: "1px solid #eee"
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600"
  },
  newButton: {
    marginBottom: "15px",
    padding: "8px 14px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500"
  }
};
