
import { useEffect, useState } from "react";
import { getMyDemandes, getDemandeById , closeDemande ,addRemarque} from "../services/demande.service";
import { getDemandeDetails } from "../../it/services/itDemande.service";
import { useNavigate } from "react-router-dom";
console.log("user token is" + localStorage.getItem("token"));
// ── Status badge config ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  CREATED: {
    label: "Created",
    dot: "bg-[#005dac]",
    border: "border-[#005dac]",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-[#ffab00]",
    border: "border-[#ffab00]",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-emerald-500",
    border: "border-emerald-500",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    dot: "bg-slate-300",
    border: "border-slate-300",
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border-l-4 shadow-sm ${cfg.border}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className="text-xs font-bold uppercase tracking-tighter text-[#191c1e]">
        {cfg.label}
      </span>
    </div>
  );
}

// ── Spinner helper ────────────────────────────────────────────────────────────
function Spinner({ className = "h-5 w-5" }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Details Drawer ─────────────────────────────────────────────────────────────
function DemandeDrawer({ demandeId, onClose }) {
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [remarque, setRemarque] = useState("");

  useEffect(() => {
    if (!demandeId) return;
    setLoading(true);
    setError("");
    setDemande(null);
    getDemandeById(demandeId)
      .then(setDemande)
      .catch(() => setError("Failed to load details"))
      .finally(() => setLoading(false));
  }, [demandeId]);

  const handleCloseDemande = async () => {
      if (!window.confirm("Close this demande?")) return;
      setActionLoading(true);
      try {
        console.log("Closing demande", demande.DEMANDE_ID);
        await closeDemande(demande.DEMANDE_ID);
        const updated = await getDemandeById(demande.DEMANDE_ID);
        setDemande(updated);
        onStatusChanged();
      } catch {
        alert("Failed to close demande");
      } finally {
        setActionLoading(false);
      }
    };

    const addremarque = async () => {
      if (!remarque.trim()) return alert("Remarque cannot be empty");
      setActionLoading(true);
      try {        await addRemarque(demande.DEMANDE_ID, remarque);
        const updated = await getDemandeById(demande.DEMANDE_ID);
        setDemande(updated);
        onStatusChanged();
      } catch {
        alert("Failed to add remarque");
      } finally {        setActionLoading(false);
      }
    };

  const FIELD_ROWS = demande
    ? [
        { label: "Request ID",  value: `REQ-${demande.DEMANDE_ID}`,                       mono: true  },
        { label: "Nature",      value: demande.NATURE_NAME                                              },
        { label: "Structure",   value: demande.STRUCTURE_NAME                                           },
        { label: "Created at",  value: new Date(demande.CREATED_AT).toLocaleString()                   },
      ]
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eceef0]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">
              Request Details
            </p>
            <h3 className="text-lg font-extrabold tracking-tight text-[#191c1e] mt-0.5">
              {demande ? `REQ-${demande.DEMANDE_ID}` : "Loading…"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#414752] hover:bg-[#f2f4f6] hover:text-[#191c1e] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {loading && (
            <div className="flex items-center justify-center py-20 text-[#414752]">
              <svg className="animate-spin h-5 w-5 mr-3 text-[#005dac]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading details…
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium">
              {error}
            </div>
          )}

          {!loading && demande && (
            <>
              {/* Status badge — prominent */}
              <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-xl">
                <span className="text-xs font-bold uppercase tracking-widest text-[#414752]">
                  Current Status
                </span>
                <StatusBadge status={demande.STATUS} />
              </div>

              {/* Field rows */}
              <div className="bg-white border border-[#eceef0] rounded-xl divide-y divide-[#eceef0] overflow-hidden">
                {FIELD_ROWS.map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#414752] w-28 shrink-0">
                      {label}
                    </span>
                    <span
                      className={`text-sm text-right text-[#191c1e] ${
                        mono ? "font-mono font-bold text-[#005dac]" : "font-medium"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {demande.DESCRIPTION && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#414752] mb-2">
                    Description
                  </p>
                  <div className="bg-[#f8f9fb] border border-[#eceef0] rounded-xl px-4 py-4 text-sm text-[#191c1e] leading-relaxed whitespace-pre-wrap">
                    {demande.DESCRIPTION}
                  </div>
                </div>
              )}

               

              {demande.STATUS === "IN_PROGRESS" && (
  <>
    {/* Remarque input (only if none exists yet) */}
    {!demande.REMARQUE && (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">
          Remarque
        </p>

        <textarea
          id="description"
          rows={4}
          value={remarque} // controlled by local state
          onChange={(e) => setRemarque(e.target.value)}
          placeholder="Describe the issue or request in detail…"
          className="w-full px-4 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm placeholder:text-[#717783] focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none resize-none"
        />

        <button
          onClick={addremarque}
          disabled={actionLoading}
          className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {actionLoading ? (
            <>
              <Spinner className="h-4 w-4" />
              Adding…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Add Remarque
            </>
          )}
        </button>
      </div>
    )}

    {/* Display existing remarque */}
    {demande.REMARQUE && (
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#414752] mb-2">
          Remarque
        </p>
        <div className="bg-[#f8f9fb] border border-[#eceef0] rounded-xl px-4 py-4 text-sm text-[#191c1e] leading-relaxed whitespace-pre-wrap">
          {demande.REMARQUE}
        </div>
      </div>
    )}

    {/* Action to close demande */}
    <div className="bg-green-50 border border-green-100 rounded-xl p-5 space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-1">
          Action Available
        </p>
        <h4 className="text-sm font-extrabold text-[#191c1e]">Mark as Completed</h4>
        <p className="text-xs text-[#414752] mt-1">
          This will close the demande and mark it as resolved.
        </p>
      </div>
      <button
        onClick={handleCloseDemande}
        disabled={actionLoading}
        className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {actionLoading ? (
          <>
            <Spinner className="h-4 w-4" />
            Closing…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Close Demande
          </>
        )}
      </button>
    </div>
  </>
)}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NEW_REQUEST_ITEMS = [
  { label: "Intervention",  icon: "build",        path: "/user/demandes/new" },
  { label: "Réparation",    icon: "handyman",     path: "/user/demandes/new/reparation"   },
  { label: "Équipement",    icon: "devices",      path: "/user/demandes/equipment"    },
];

function Sidebar() {
  const navigate = useNavigate();
  const [newRequestOpen, setNewRequestOpen] = useState(false);

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

      {/* Nav */}
      <nav className="space-y-1">
       
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 bg-white text-blue-700 rounded-xl shadow-sm font-semibold active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-xl">list_alt</span>
          <span className="text-sm">My Requests</span>
        </a>

        {/* New Request accordion */}
        <div>
          <button
            onClick={() => setNewRequestOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200 transition-colors duration-200 rounded-xl active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span className="text-sm font-medium flex-1 text-left">New Request</span>
            <span
              className="material-symbols-outlined text-base transition-transform duration-200"
              style={{ transform: newRequestOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown items */}
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
export default function MyDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);

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

  // Derived stats
  const total = demandes.length;
  const inProgress = demandes.filter((d) => d.STATUS === "IN_PROGRESS").length;
  const completed = demandes.filter((d) => d.STATUS === "COMPLETED").length;
  const created = demandes.filter((d) => d.STATUS === "CREATED").length;

  // Tab filtering
  const filteredDemandes = demandes.filter((d) => {
    if (activeTab === "open") return d.STATUS === "CREATED" || d.STATUS === "IN_PROGRESS";
    if (activeTab === "resolved") return d.STATUS === "COMPLETED";
    return true;
  });

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] flex min-h-screen overflow-hidden font-['Inter',sans-serif]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f8f9fb]">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">
                My Requests
              </h2>
              <p className="text-[#414752] mt-1">
                Track and manage your IT service tickets and hardware requests.
              </p>
            </div>
            <button
              onClick={() => navigate("/user/demandes/new")}
              className="text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg active:scale-[0.98] transition-all hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #005dac 0%, #1976d2 100%)" }}
            >
              <span className="material-symbols-outlined">add</span>
              New Request
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl flex flex-col justify-between h-32">
              <span className="text-xs font-bold tracking-widest text-[#414752] uppercase">
                Total Active
              </span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-[#191c1e]">
                  {String(inProgress + created).padStart(2, "0")}
                </span>
                <span className="material-symbols-outlined text-blue-600/20 text-5xl">
                  pending_actions
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl flex flex-col justify-between h-32">
              <span className="text-xs font-bold tracking-widest text-[#414752] uppercase">
                Pending
              </span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-[#191c1e]">
                  {String(created).padStart(2, "0")}
                </span>
                <span className="material-symbols-outlined text-[#944700]/20 text-5xl">
                  rule
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl flex flex-col justify-between h-32">
              <span className="text-xs font-bold tracking-widest text-[#414752] uppercase">
                Recently Closed
              </span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-[#191c1e]">
                  {String(completed).padStart(2, "0")}
                </span>
                <span className="material-symbols-outlined text-emerald-600/20 text-5xl">
                  task_alt
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-between h-32">
              <span className="text-xs font-bold tracking-widest text-blue-700 uppercase">
                Total
              </span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-blue-800">{total}</span>
                <span className="material-symbols-outlined text-blue-600/30 text-5xl">
                  analytics
                </span>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            {/* Tabs + filter bar */}
            <div className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between">
              <div className="flex gap-4">
                {[
                  { key: "all", label: "All Requests" },
                  { key: "open", label: "Open" },
                  { key: "resolved", label: "Resolved" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`text-sm pb-1 px-1 transition-colors ${
                      activeTab === tab.key
                        ? "font-semibold text-[#005dac] border-b-2 border-[#005dac]"
                        : "font-medium text-[#414752] hover:text-[#191c1e]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button className="text-[#414752] hover:text-[#191c1e] flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filter
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16 text-[#414752]">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-[#005dac]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading your requests...
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="mx-6 my-4 px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium">
                {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredDemandes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-[#414752]">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inbox</span>
                <p className="font-semibold">No requests found</p>
                <p className="text-xs mt-1">Submit a new request to get started</p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && filteredDemandes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f2f4f6]/50">
                      {["Request ID", "Nature", "Status", "Date Submitted", "Action"].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#414752] ${
                              i === 4 ? "text-right" : ""
                            }`}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef0]">
                    {filteredDemandes.map((d) => (
                      <tr
                        key={d.DEMANDE_ID}
                        className="hover:bg-[#f2f4f6] transition-colors cursor-pointer group"
                        onClick={() => setSelectedDemandeId(d.DEMANDE_ID)}
                      >
                        <td className="px-6 py-5 font-mono text-xs font-bold text-[#005dac]">
                          REQ-{d.DEMANDE_ID}
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-[#191c1e]">
                          {d.NATURE_NAME}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={d.STATUS} />
                        </td>
                        <td className="px-6 py-5 text-sm text-[#414752]">
                          {new Date(d.CREATED_AT).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            className="p-2 hover:bg-white rounded-lg transition-all text-[#414752] hover:text-[#005dac]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDemandeId(d.DEMANDE_ID);
                            }}
                          >
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table footer */}
            {!loading && filteredDemandes.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-[#eceef0] bg-[#f2f4f6]/20">
                <p className="text-xs text-[#414752] font-medium">
                  Showing {filteredDemandes.length} of {total} requests
                </p>
              </div>
            )}
          </div>

         
        </div>
      </main>

      {/* Details Drawer */}
      {selectedDemandeId && (
        <DemandeDrawer
          demandeId={selectedDemandeId}
          onClose={() => setSelectedDemandeId(null)}
        />
      )}
    </div>
  );
}