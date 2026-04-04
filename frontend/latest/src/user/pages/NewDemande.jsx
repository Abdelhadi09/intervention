
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStructures, getNatures, getAllIntervenant } from "../../shared/services/reference.service";
import { createDemande } from "../services/demande.service";

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NEW_REQUEST_ITEMS = [
  { label: "Intervention", icon: "build",       path: "/user/demandes/new" },
  { label: "Équipement",   icon: "devices",     path: "/user/demandes/equipment"    },
];

function Sidebar() {
  const navigate = useNavigate();
  const [newRequestOpen, setNewRequestOpen] = useState(true); // open by default on this page

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-slate-100 p-4 overflow-y-auto font-['Inter'] tracking-tight shrink-0">
      {/* Brand */}
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
       
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate("/user/demandes"); }}
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200 transition-colors duration-200 rounded-xl active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-xl">list_alt</span>
          <span className="text-sm font-medium">My Requests</span>
        </a>

        {/* New Request accordion — active */}
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200 hover:text-[#005dac] transition-colors duration-150 rounded-lg active:scale-[0.98] group"
                >
                  <span className="material-symbols-outlined text-lg group-hover:text-[#005dac] transition-colors">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User card */}
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
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
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

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NewDemande() {
  const [structures, setStructures] = useState([]);
  const [natures, setNatures] = useState([]);
  const [intervenants, setIntervenants] = useState([]);

  const [structureId, setStructureId] = useState("");
  const [natureId, setNatureId] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      const [structuresData, naturesData, intervenantsData] = await Promise.all([
        getStructures(),
        getNatures(),
        getAllIntervenant(),
      ]);
      setStructures(structuresData);
      setNatures(naturesData);
      setIntervenants(intervenantsData);
    } catch {
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

    setSubmitting(true);
    try {
      await createDemande({ structure_id: structureId, nature_id: natureId, description });
      navigate("/user/demandes");
    } catch {
      setError("Failed to create demande");
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

          {/* Page Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/user/demandes")}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#414752] hover:text-[#005dac] transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to My Requests
            </button>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">New Demande</h2>
            <p className="text-[#414752] mt-1">Fill in the details below to submit a new IT request.</p>
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
              {/* Error banner */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Form card */}
              <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#eceef0] bg-[#f2f4f6]/30">
                  <h3 className="text-base font-bold tracking-tight text-[#191c1e]">Request Information</h3>
                  <p className="text-xs text-[#414752] mt-0.5">All fields are required</p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

                  {/* Structure */}
                  <div className="space-y-2">
                    <label
                      htmlFor="structure"
                      className="block text-xs font-bold uppercase tracking-widest text-[#414752]"
                    >
                      Structure
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-lg pointer-events-none">
                        business
                      </span>
                      <select
                        id="structure"
                        value={structureId}
                        onChange={(e) => setStructureId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm font-medium focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none cursor-pointer appearance-none"
                      >
                        <option value="">— Select Structure —</option>
                        {structures.map((s) => (
                          <option key={s.STRUCTURE_ID} value={s.STRUCTURE_ID}>
                            {s.STRUCTURE_NAME}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#717783] text-base pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Nature */}
                  <div className="space-y-2">
                    <label
                      htmlFor="nature"
                      className="block text-xs font-bold uppercase tracking-widest text-[#414752]"
                    >
                      Nature
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-lg pointer-events-none">
                        category
                      </span>
                      <select
                        id="nature"
                        value={natureId}
                        onChange={(e) => setNatureId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm font-medium focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none cursor-pointer appearance-none"
                      >
                        <option value="">— Select Nature —</option>
                        {natures.map((n) => (
                          <option key={n.NATURE_ID} value={n.NATURE_ID}>
                            {n.NATURE_NAME}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#717783] text-base pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-xs font-bold uppercase tracking-widest text-[#414752]"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the issue or request in detail…"
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
                          Submit Demande
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