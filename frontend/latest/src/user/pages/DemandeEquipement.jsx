// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getEquipementTypes, getSousTypesByType } from "../../shared/services/reference.service";
// import { createDemandeEquipement } from "../services/demande.service";

// export default function DemandeEquipement() {
//   const [equipementTypes, setEquipementTypes] = useState([]);
//   const [sousTypes, setSousTypes] = useState([]);
//   const [typeEquipement, setTypeEquipement] = useState("");
//   const [sousType, setSousType] = useState("");
//   const [quantite, setQuantite] = useState(1);
//   const [observation, setObservation] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadEquipementTypes = async () => {
//       try {
//         const data = await getEquipementTypes();
//         setEquipementTypes(data);
//         console.log("Loaded equipement types:", data);
//       } catch (err) {
//         setError("Failed to load equipement types");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadEquipementTypes();
//   }, []);

//   const handleTypeChange = async (event) => {
//     const selectedType = event.target.value;
//     setTypeEquipement(selectedType);
//     setSousType("");
//     setSousTypes([]);
//     try {
//       const data = await getSousTypesByType(selectedType);
//       setSousTypes(data);
//     } catch (err) {
//       setError("Failed to load sous-types");
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError("");

//     if (!typeEquipement || !sousType || quantite < 1) {
//       setError("All fields are required");
//       return;
//     }

//     try {
//       await createDemandeEquipement({
//         type_equipement: typeEquipement,
//         sous_type: sousType,
//         quantite,
//         observation,
//       });

//       navigate("/user/demandes");
//     } catch (err) {
//       setError("Failed to create demande d'equipement");
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div>
//       <h2>New Demande d'Equipement</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Type d'Equipement:</label>
//           <select value={typeEquipement} onChange={handleTypeChange}>
//             <option value="">-- Select Type --</option>
//             {equipementTypes.map((type) => (
//               <option key={type.TYPE_ID} value={type.TYPE_ID}>
//                 {type.LIBELLE}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label>Sous-Type:</label>
//           <select
//             value={sousType}
//             onChange={(event) => setSousType(event.target.value)}
//             disabled={!sousTypes.length}
//           >
//             <option value="">Select sous-type</option>
//             {sousTypes.map((st) => (
//               <option key={st.ID} value={st.ID}>
//                 {st.LIBELLE}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label>Quantité:</label>
//           <input
//             type="number"
//             value={quantite}
//             onChange={(event) => setQuantite(Number(event.target.value))}
//             min="1"
//           />
//         </div>
//         <div>
//           <label>Observation:</label>
//           <textarea
//             value={observation}
//             onChange={(event) => setObservation(event.target.value)}
//           />
//         </div>
//         <button type="submit">Create Demande</button>
//       </form>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEquipementTypes, getSousTypesByType } from "../../shared/services/reference.service";
import { createDemandeEquipement } from "../services/demande.service";

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NEW_REQUEST_ITEMS = [

  { label: "Intervention", icon: "build",       path: "/user/demandes/new" },
  { label: "Équipement",   icon: "devices",     path: "/user/demandes/equipment"    },
];

function Sidebar() {
  const navigate = useNavigate();
  const [newRequestOpen, setNewRequestOpen] = useState(true);

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-slate-100 p-4 overflow-y-auto font-['Inter'] tracking-tight shrink-0">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="  w-10 h-10 rounded-full bg-[#e6e8ea] flex items-center justify-center">
            <img src="../src/assets/logoencc.png" alt="Logo" className="w-16 h-10" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tighter">
            ENCC IT Service Desk
          </h1>
          
        </div>
      </div>
      <nav className="space-y-1">
        
        <button
          onClick={() => navigate("/user/demandes")}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200 transition-colors duration-200 rounded-xl active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-xl">list_alt</span>
          <span className="text-sm font-medium">My Requests</span>
        </button>

        <div>
          <button
            onClick={() => setNewRequestOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-blue-700 rounded-xl shadow-sm font-semibold transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span className="text-sm flex-1 text-left">New Request</span>
            <span
              className="material-symbols-outlined text-base transition-transform duration-200"
              style={{ transform: newRequestOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              expand_more
            </span>
          </button>

          {newRequestOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-[#005dac]/20 space-y-0.5">
              {NEW_REQUEST_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 rounded-lg active:scale-[0.98] group text-sm font-medium
                    ${item.path.includes("equipment")
                      ? "bg-[#005dac]/10 text-[#005dac]"
                      : "text-slate-500 hover:bg-slate-200 hover:text-[#005dac]"
                    }`}
                >
                  <span className={`material-symbols-outlined text-lg transition-colors ${item.path.includes("equipment") ? "text-[#005dac]" : "group-hover:text-[#005dac]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="mt-auto pt-8">
        <div className="bg-slate-200/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6e8ea] flex items-center justify-center text-xs font-bold text-[#005dac]">
            ME
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">My Account</p>
            <p className="text-xs text-slate-500 truncate">Standard User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Top Bar ────────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header className="flex justify-between items-center h-16 px-8 w-full sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm z-40">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="w-full bg-[#f2f4f6] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
            placeholder="Search requests, assets, or documentation..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-blue-600 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-blue-600 transition-colors">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}

// ── Select Field ───────────────────────────────────────────────────────────────
function SelectField({ id, label, icon, value, onChange, disabled, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-[#414752]">
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-lg pointer-events-none">
          {icon}
        </span>
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm font-medium focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#717783] text-base pointer-events-none">
          expand_more
        </span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DemandeEquipement() {
  const [equipementTypes, setEquipementTypes] = useState([]);
  const [sousTypes, setSousTypes] = useState([]);
  const [typeEquipement, setTypeEquipement] = useState("");
  const [sousType, setSousType] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getEquipementTypes()
      .then(setEquipementTypes)
      .catch(() => setError("Failed to load equipment types"))
      .finally(() => setLoading(false));
  }, []);

  const handleTypeChange = async (e) => {
    const selectedType = e.target.value;
    setTypeEquipement(selectedType);
    setSousType("");
    setSousTypes([]);
    if (!selectedType) return;
    try {
      const data = await getSousTypesByType(selectedType);
      setSousTypes(data);
    } catch {
      setError("Failed to load sous-types");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!typeEquipement  || quantite < 1) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      await createDemandeEquipement({ type_equipement: typeEquipement, sous_type: sousType, quantite, observation });
      navigate("/user/demandes");
    } catch {
      setError("Failed to create demande d'équipement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] flex min-h-screen overflow-hidden font-['Inter',sans-serif]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-y-auto p-8">

          {/* Page header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/user/demandes")}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#414752] hover:text-[#005dac] transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to My Requests
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-[#005dac]/10 flex items-center justify-center text-[#005dac]">
                <span className="material-symbols-outlined text-xl">devices</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">
                New Equipment Request
              </h2>
            </div>
            <p className="text-[#414752] mt-1 ml-12">
              Specify the type, sub-type, quantity, and any observations.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 text-[#414752] py-10">
              <svg className="animate-spin h-5 w-5 text-[#005dac]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading form data…
            </div>
          )}

          {!loading && (
            <div className="max-w-2xl">
              {/* Error */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Form card */}
              <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#eceef0] bg-[#f2f4f6]/30">
                  <h3 className="text-base font-bold tracking-tight text-[#191c1e]">Equipment Details</h3>
                  <p className="text-xs text-[#414752] mt-0.5">Type, sub-type and quantity are required</p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

                  {/* Type d'équipement */}
                  <SelectField
                    id="type"
                    label="Type d'Équipement"
                    icon="category"
                    value={typeEquipement}
                    onChange={handleTypeChange}
                  >
                    <option value="">— Select Type —</option>
                    {equipementTypes.map((t) => (
                      <option key={t.TYPE_ID} value={t.TYPE_ID}>{t.LIBELLE}</option>
                    ))}
                  </SelectField>

                  {/* Sous-type */}
                  <div className="space-y-2">
                    <label htmlFor="soustype" className="block text-xs font-bold uppercase tracking-widest text-[#414752]">
                      Sous-Type
                      {!typeEquipement && (
                        <span className="ml-2 normal-case font-normal text-[#717783]">— select a type first</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-lg pointer-events-none">
                        tune
                      </span>
                      <select
                        id="soustype"
                        value={sousType}
                        onChange={(e) => setSousType(e.target.value)}
                        disabled={!sousTypes.length}
                        className="w-full pl-10 pr-10 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm font-medium focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">— Select Sous-Type —</option>
                        {sousTypes.map((st) => (
                          <option key={st.ID} value={st.ID}>{st.LIBELLE}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#717783] text-base pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Quantité */}
                  <div className="space-y-2">
                    <label htmlFor="quantite" className="block text-xs font-bold uppercase tracking-widest text-[#414752]">
                      Quantité
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-lg pointer-events-none">
                        pin
                      </span>
                      <input
                        id="quantite"
                        type="number"
                        min="1"
                        value={quantite}
                        onChange={(e) => setQuantite(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm font-medium focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Observation */}
                  <div className="space-y-2">
                    <label htmlFor="observation" className="block text-xs font-bold uppercase tracking-widest text-[#414752]">
                      Observation
                      <span className="ml-2 normal-case font-normal text-[#717783]">— optional</span>
                    </label>
                    <textarea
                      id="observation"
                      rows={4}
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      placeholder="Add any additional notes or context…"
                      className="w-full px-4 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm placeholder:text-[#717783] focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #005dac 0%, #1976d2 100%)" }}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Submitting…
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send</span>
                          Create Demande
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/user/demandes")}
                      className="px-6 py-3 rounded-lg border border-[#c1c6d4] text-sm font-semibold text-[#414752] hover:bg-[#e6e8ea] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}