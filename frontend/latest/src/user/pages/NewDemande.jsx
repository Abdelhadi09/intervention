import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStructures, getNatures } from "../../shared/services/reference.service";
import { createDemande } from "../services/demande.service";

export default function NewDemande() {
  const [structures, setStructures] = useState([]);
  const [natures, setNatures] = useState([]);

  const [structureId, setStructureId] = useState("");
  const [natureId, setNatureId] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      const [structuresData, naturesData] = await Promise.all([
        getStructures(),
        getNatures()
      ]);
      setStructures(structuresData);
      setNatures(naturesData);
    } catch (err) {
      setError("Failed to load reference data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!structureId || !natureId || !description) {
      setError("All fields are required");
      return;
    }

    try {
      await createDemande({
        structure_id: structureId,
        nature_id: natureId,
        description
      });

      navigate("/user/demandes");
    } catch (err) {
      setError("Failed to create demande");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2>New Demande</h2>

      {error && <p style={styles.error}>{error}</p>}
<div style={styles.card}>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
        <label>
          Structure
          <select value={structureId} onChange={(e) => setStructureId(e.target.value)}>
            <option value="">-- Select Structure --</option>
            {structures.map((s) => (
              <option key={s.STRUCTURE_ID} value={s.STRUCTURE_ID}>
                {s.STRUCTURE_NAME}
              </option>
            ))}
          </select>
        </label>
</div>
<div style={styles.field}>
        <label>
          Nature
          <select value={natureId} onChange={(e) => setNatureId(e.target.value)}>
            <option value="">-- Select Nature --</option>
            {natures.map((n) => (
              <option key={n.NATURE_ID} value={n.NATURE_ID}>
                {n.NATURE_NAME}
              </option>
            ))}
          </select>
        </label>
        </div>
        <div style={styles.field}>
        <label>
          Description
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        </div>
        <button style={styles.submitBtn}
         type="submit">Submit Demande</button>
      </form>
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
    padding: "25px",
    maxWidth: "600px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  // form: {
  //   display: "flex",
  //   flexDirection: "column",
  //   gap: "10px"
  // },
    field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px"
  },
  error: {
    color: "#d32f2f",
    marginBottom: "10px"
  },
  submitBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600"
  }
};
