import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllDemandes,
  updateDemandeStatus,
  getDemandeDetails,
  getAllDemandesEquipement,
} from "../services/itDemande.service";
import {
  startIntervention,
  changeDemandeStatus,
  closeDemande,
} from "../services/intervention.service";
import { getAllIntervenant } from "../../shared/services/reference.service";
import ConfirmModal from "../../shared/components/ConfirmModal";

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  CREATED: {
    label: "Created",
    classes: "bg-[#ffdbc7] text-[#311300] border-l-2 border-[#944700]",
  },
  IN_PROGRESS: {
    label: "In Progress",
    classes: "bg-white border-l-2 border-[#005dac] text-[#005dac]",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-white border-l-2 border-green-500 text-green-600",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-[#e0e3e5] text-[#414752]" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${cfg.classes}`}>
      {cfg.label}
    </span>
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

// ── Pagination ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

function Pagination({ total, page, onPageChange, accentColor = "#005dac" }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  };

  const btnBase = "w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors";

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`${btnBase} border border-[#c1c6d4]/50 text-[#414752] hover:bg-[#f2f4f6] disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      {getPages().map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#414752]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${
              p === page
                ? "text-white shadow-sm"
                : "border border-[#c1c6d4]/50 text-[#414752] hover:bg-[#f2f4f6]"
            }`}
            style={p === page ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` } : {}}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`${btnBase} border border-[#c1c6d4]/50 text-[#414752] hover:bg-[#f2f4f6] disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
}

// ── IT Demande Drawer ─────────────────────────────────────────────────────────
function ITDemandeDrawer({ demandeId, onClose, onStatusChanged }) {
  const [demande, setDemande] = useState(null);
  const [intervenants, setIntervenants] = useState([]);
  const [intervenantId, setIntervenantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!demandeId) return;
    setLoading(true);
    setError("");
    setDemande(null);
    setIntervenantId("");

    Promise.all([getDemandeDetails(demandeId), getAllIntervenant()])
      .then(([demandeData, intervenantsData]) => {
        setDemande(demandeData);
        setIntervenants(intervenantsData);
      })
      .catch(() => setError("Failed to load details"))
      .finally(() => setLoading(false));
  }, [demandeId]);

  const handleStartIntervention = async () => {
    if (!intervenantId) return alert("Select an intervenant");
    setActionLoading(true);
    try {
      await startIntervention(demande.DEMANDE_ID, intervenantId);
      await changeDemandeStatus(demande.DEMANDE_ID, "IN_PROGRESS");
      const updated = await getDemandeDetails(demande.DEMANDE_ID);
      setDemande(updated);
      onStatusChanged();
    } catch {
      alert("Failed to start intervention");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDemande = async () => {
    if (!window.confirm("Close this demande?")) return;
    setActionLoading(true);
    try {
      await closeDemande(demande.DEMANDE_ID);
      const updated = await getDemandeDetails(demande.DEMANDE_ID);
      setDemande(updated);
      onStatusChanged();
    } catch {
      alert("Failed to close demande");
    } finally {
      setActionLoading(false);
    }
  };

  const FIELD_ROWS = demande
    ? [
        { label: "Request ID",  value: `#${demande.DEMANDE_ID}`, mono: true },
        { label: "Structure",   value: demande.STRUCTURE_NAME               },
        { label: "Nature",      value: demande.NATURE_NAME                  },
        { label: "Created By",  value: demande.CREATED_BY                   },
        { label: "Intervenant", value: demande.INTERVENANT || "—"           },
        { label: "Created At",  value: new Date(demande.CREATED_AT).toLocaleString() },
      ]
    : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eceef0]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">IT — Request Details</p>
            <h3 className="text-lg font-extrabold tracking-tight text-[#191c1e] mt-0.5">
              {demande ? `#${demande.DEMANDE_ID}` : "Loading…"}
            </h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#414752] hover:bg-[#f2f4f6] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-20 text-[#414752]">
              <Spinner className="h-5 w-5 mr-3 text-[#005dac]" />
              Loading details…
            </div>
          )}
          {!loading && error && (
            <div className="px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium">{error}</div>
          )}
          {!loading && demande && (
            <>
              <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-xl">
                <span className="text-xs font-bold uppercase tracking-widest text-[#414752]">Current Status</span>
                <StatusBadge status={demande.STATUS} />
              </div>
              <div className="bg-white border border-[#eceef0] rounded-xl divide-y divide-[#eceef0] overflow-hidden">
                {FIELD_ROWS.map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#414752] w-28 shrink-0">{label}</span>
                    <span className={`text-sm text-right text-[#191c1e] ${mono ? "font-mono font-bold text-[#005dac]" : "font-medium"}`}>{value}</span>
                  </div>
                ))}
              </div>
              {demande.DESCRIPTION && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#414752] mb-2">Description</p>
                  <div className="bg-[#f8f9fb] border border-[#eceef0] rounded-xl px-4 py-4 text-sm text-[#191c1e] leading-relaxed whitespace-pre-wrap">
                    {demande.DESCRIPTION}
                  </div>
                </div>
              )}
              {demande.REMARQUE && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#414752] mb-2">Remarque</p>
                  <div className="bg-[#f8f9fb] border border-[#eceef0] rounded-xl px-4 py-4 text-sm text-[#191c1e] leading-relaxed whitespace-pre-wrap">
                    {demande.REMARQUE}
                  </div>
                </div>
              )}
              {demande.STATUS === "CREATED" && (
                <div className="bg-[#f2f4f6] rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#414752] mb-1">Action Required</p>
                    <h4 className="text-sm font-extrabold text-[#191c1e]">Assign & Start Intervention</h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#414752]">Intervenant</label>
                    <select
                      value={intervenantId}
                      onChange={(e) => setIntervenantId(e.target.value)}
                      className="w-full text-sm bg-white border border-[#c1c6d4] rounded-lg px-3 py-2.5 font-medium text-[#191c1e] focus:ring-2 focus:ring-[#005dac]/20 outline-none cursor-pointer"
                    >
                      <option value="">— Select Intervenant —</option>
                      {intervenants.map((i) => (
                        <option key={i.FULL_NAME} value={i.FULL_NAME}>{i.FULL_NAME}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleStartIntervention}
                    disabled={actionLoading || !intervenantId}
                    className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #005dac, #1976d2)" }}
                  >
                    {actionLoading ? <><Spinner className="h-4 w-4" />Starting…</> : <><span className="material-symbols-outlined text-sm">play_arrow</span>Assign & Start</>}
                  </button>
                </div>
              )}
              {/* {demande.STATUS === "IN_PROGRESS" && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-1">Action Available</p>
                    <h4 className="text-sm font-extrabold text-[#191c1e]">Mark as Completed</h4>
                    <p className="text-xs text-[#414752] mt-1">This will close the demande and mark it as resolved.</p>
                  </div>
                  <button
                    onClick={handleCloseDemande}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <><Spinner className="h-4 w-4" />Closing…</> : <><span className="material-symbols-outlined text-sm">check_circle</span>Close Demande</>}
                  </button>
                </div>
              )} */}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#eceef0] bg-[#f8f9fb]">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg border border-[#c1c6d4] text-sm font-semibold text-[#414752] hover:bg-[#e6e8ea] transition-colors">
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// ── Equipment Demande Drawer ───────────────────────────────────────────────────
function EquipementDrawer({ demande, onClose }) {
  if (!demande) return null;

  const FIELD_ROWS = [
    { label: "Request ID",      value: `#${demande.DEMANDE_ID}`, mono: true       },
    { label: "Type",            value: demande.TYPE_EQUIPEMENT                    },
    { label: "Sous-Type",       value: demande.SOUS_TYPE                          },
    { label: "Quantité",        value: String(demande.QUANTITE)                   },
    { label: "Requested By",    value: demande.CREATED_BY_1 || demande.CREATED_BY },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eceef0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#944700]/10 flex items-center justify-center text-[#944700]">
              <span className="material-symbols-outlined text-xl">devices</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">Equipment Request</p>
              <h3 className="text-lg font-extrabold tracking-tight text-[#191c1e] mt-0.5">
                #{demande.DEMANDE_ID}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#414752] hover:bg-[#f2f4f6] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Qty highlight */}
          <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#414752]">Quantity Requested</span>
            <span className="text-2xl font-extrabold tracking-tighter text-[#191c1e]">{demande.QUANTITE}</span>
          </div>

          {/* Fields */}
          <div className="bg-white border border-[#eceef0] rounded-xl divide-y divide-[#eceef0] overflow-hidden">
            {FIELD_ROWS.map(({ label, value, mono }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3.5">
                <span className="text-xs font-bold uppercase tracking-widest text-[#414752] w-32 shrink-0">{label}</span>
                <span className={`text-sm text-right text-[#191c1e] ${mono ? "font-mono font-bold text-[#005dac]" : "font-medium"}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Observation */}
          {demande.OBSERVATION && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#414752] mb-2">Observation</p>
              <div className="bg-[#f8f9fb] border border-[#eceef0] rounded-xl px-4 py-4 text-sm text-[#191c1e] leading-relaxed whitespace-pre-wrap">
                {demande.OBSERVATION}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#eceef0] bg-[#f8f9fb]">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg border border-[#c1c6d4] text-sm font-semibold text-[#414752] hover:bg-[#e6e8ea] transition-colors">
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-slate-100 font-['Inter'] tracking-tight p-4 shrink-0 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-full bg-[#e6e8ea] flex items-center justify-center">
          <img src="../src/assets/logoencc.png" alt="Logo" className="w-16 h-10" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tighter">ENCC IT Service Desk</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white text-blue-700 rounded-xl shadow-sm font-semibold transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>
      </nav>
      <div className="mt-auto p-2 bg-[#f2f4f6] rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#e6e8ea] flex items-center justify-center text-xs font-bold text-[#005dac]">IT</div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold truncate">IT Admin</p>
          <p className="text-xs text-[#414752] truncate">System Administrator</p>
        </div>
      </div>
    </aside>
  );
}

// ── Top Header ─────────────────────────────────────────────────────────────────
function TopBar({ statusFilter, onFilterChange }) {
  return (
    <header className="flex justify-between items-center h-16 px-8 w-full sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100 shadow-sm text-sm font-medium">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414752]">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border-none rounded-lg focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all"
            placeholder="Search architectural ledger..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mr-6">
        <label className="text-xs font-bold uppercase tracking-widest text-[#414752]">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="text-sm bg-[#f2f4f6] border-none rounded-lg px-3 py-2 font-medium text-[#191c1e] focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
        >
          <option value="">All</option>
          <option value="CREATED">Created</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-[#c1c6d4] pr-6">
          <button className="text-slate-600 hover:text-blue-600 transition-colors">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ITDashboard() {
  const [demandes, setDemandes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);

  // Equipment demandes state
  const [demandesEquipement, setDemandesEquipement] = useState([]);
  const [equipLoading, setEquipLoading] = useState(true);
  const [equipError, setEquipError] = useState("");
  const [selectedEquipement, setSelectedEquipement] = useState(null);

  // Pagination state
  const [demandesPage, setDemandesPage] = useState(1);
  const [equipPage, setEquipPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    setDemandesPage(1);
    loadDemandes();
    loadDemandesEquipement();
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

  const loadDemandesEquipement = async () => {
    try {
      setEquipLoading(true);
      const data = await getAllDemandesEquipement();
      setDemandesEquipement(data);
    } catch {
      setEquipError("Failed to load equipment requests");
    } finally {
      setEquipLoading(false);
    }
  };

  const askStatusChange = (demande, status) => {
    setSelectedDemande(demande);
    setNextStatus(status);
    setConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    try {
      await updateDemandeStatus(selectedDemande.DEMANDE_ID, nextStatus);
      setConfirmOpen(false);
      setSelectedDemande(null);
      setNextStatus("");
      loadDemandes();
    } catch {
      alert("Failed to update status");
    }
  };

  const total = demandes.length;
  const inProgress = demandes.filter((d) => d.STATUS === "IN_PROGRESS").length;
  const completed = demandes.filter((d) => d.STATUS === "COMPLETED").length;
  const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Paginated slices
  const pagedDemandes = demandes.slice((demandesPage - 1) * PAGE_SIZE, demandesPage * PAGE_SIZE);
  const pagedEquipement = demandesEquipement.slice((equipPage - 1) * PAGE_SIZE, equipPage * PAGE_SIZE);

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] flex min-h-screen overflow-hidden font-['Inter',sans-serif]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <TopBar statusFilter={statusFilter} onFilterChange={setStatusFilter} />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">

          {/* Page Header */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#414752] mb-1">Architectural Overview</p>
              <h2 className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">System Dashboard</h2>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] border border-transparent hover:border-[#005dac]/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#005dac]/10 flex items-center justify-center text-[#005dac]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                </div>
                <span className="text-xs font-bold text-[#414752]">All time</span>
              </div>
              <p className="text-sm font-bold text-[#414752] uppercase tracking-wider mb-1">Total Requests</p>
              <h3 className="text-4xl font-extrabold tracking-tighter text-[#191c1e]">{total}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] border border-transparent hover:border-[#944700]/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#944700]/10 flex items-center justify-center text-[#944700]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                </div>
                <span className="text-xs font-bold text-[#944700]">Urgent Priority</span>
              </div>
              <p className="text-sm font-bold text-[#414752] uppercase tracking-wider mb-1">In Progress</p>
              <h3 className="text-4xl font-extrabold tracking-tighter text-[#191c1e]">{inProgress}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] border border-transparent hover:border-green-500/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <span className="text-xs font-bold text-green-600">{resolutionRate}% Resolution</span>
              </div>
              <p className="text-sm font-bold text-[#414752] uppercase tracking-wider mb-1">Completed</p>
              <h3 className="text-4xl font-extrabold tracking-tighter text-[#191c1e]">{completed}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] border border-transparent hover:border-[#944700]/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#944700]/10 flex items-center justify-center text-[#944700]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>devices</span>
                </div>
                <span className="text-xs font-bold text-[#414752]">Pending</span>
              </div>
              <p className="text-sm font-bold text-[#414752] uppercase tracking-wider mb-1">Equipment Req.</p>
              <h3 className="text-4xl font-extrabold tracking-tighter text-[#191c1e]">{demandesEquipement.length}</h3>
            </div>
          </div>

          {/* ── Demandes Table ── */}
          <section className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] overflow-hidden">
            <div className="p-6 flex justify-between items-center bg-[#f2f4f6]/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#005dac]/10 flex items-center justify-center text-[#005dac]">
                  <span className="material-symbols-outlined text-lg">list_alt</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight">All Requests Ledger</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-[#414752] hover:bg-[#e6e8ea] rounded-md transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-2 text-[#414752] hover:bg-[#e6e8ea] rounded-md transition-colors">
                  <span className="material-symbols-outlined">sort</span>
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16 text-[#414752]">
                <Spinner className="h-5 w-5 mr-3 text-[#005dac]" />
                Loading demandes...
              </div>
            )}
            {!loading && error && (
              <div className="mx-6 my-4 px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium">{error}</div>
            )}
            {!loading && !error && demandes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-[#414752]">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inbox</span>
                <p className="font-semibold">No demandes found</p>
                <p className="text-xs mt-1">Try adjusting the status filter</p>
              </div>
            )}
            {!loading && !error && demandes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f2f4f6]/50">
                      {["ID", "Structure", "Nature", "Status", "Date", "Actions"].map((h, i) => (
                        <th key={h} className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#414752] ${i === 5 ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef0]">
                    {pagedDemandes.map((d) => (
                      <tr
                        key={d.DEMANDE_ID}
                        className="hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                        onClick={() => setSelectedDemandeId(d.DEMANDE_ID)}
                      >
                        <td className="px-6 py-5 text-sm font-mono font-bold text-[#005dac]">#{d.DEMANDE_ID}</td>
                        <td className="px-6 py-5 text-sm font-semibold">{d.STRUCTURE_NAME}</td>
                        <td className="px-6 py-5 text-sm font-medium">{d.NATURE_NAME}</td>
                        <td className="px-6 py-5"><StatusBadge status={d.STATUS} /></td>
                        <td className="px-6 py-5 text-sm text-[#414752]">{new Date(d.CREATED_AT).toLocaleDateString()}</td>
                        <td className="px-6 py-5 text-right space-x-2">
                          {d.STATUS === "CREATED" && (
                            <button
                              className="px-3 py-1.5 text-xs font-bold bg-[#005dac] text-white rounded-md hover:bg-[#1976d2] transition-colors"
                              onClick={(e) => { e.stopPropagation(); askStatusChange(d, "IN_PROGRESS"); }}
                            >
                              Start
                            </button>
                          )}
                          {d.STATUS === "IN_PROGRESS" && (
                            <button
                              className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              onClick={(e) => { e.stopPropagation(); askStatusChange(d, "COMPLETED"); }}
                            >
                              Close
                            </button>
                          )}
                          <button
                            className="px-3 py-1.5 text-xs font-bold text-[#005dac] hover:bg-[#005dac]/5 rounded-md transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedDemandeId(d.DEMANDE_ID); }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && demandes.length > 0 && (
              <div className="p-6 border-t border-[#eceef0] flex justify-between items-center text-sm font-medium text-[#414752]">
                <span>
                  Showing {Math.min((demandesPage - 1) * PAGE_SIZE + 1, demandes.length)}–{Math.min(demandesPage * PAGE_SIZE, demandes.length)} of {demandes.length} result{demandes.length !== 1 ? "s" : ""}
                </span>
                <Pagination
                  total={demandes.length}
                  page={demandesPage}
                  onPageChange={setDemandesPage}
                  accentColor="#005dac"
                />
              </div>
            )}
          </section>

          {/* ── Equipment Demandes Table ── */}
          <section className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] overflow-hidden">
            <div className="p-6 flex justify-between items-center bg-[#f2f4f6]/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#944700]/10 flex items-center justify-center text-[#944700]">
                  <span className="material-symbols-outlined text-lg">devices</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Equipment Requests</h3>
                  <p className="text-xs text-[#414752] mt-0.5">Demandes d'équipement</p>
                </div>
              </div>
              <button
                onClick={loadDemandesEquipement}
                className="p-2 text-[#414752] hover:bg-[#e6e8ea] rounded-md transition-colors"
                title="Refresh"
              >
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>

            {equipLoading && (
              <div className="flex items-center justify-center py-16 text-[#414752]">
                <Spinner className="h-5 w-5 mr-3 text-[#944700]" />
                Loading equipment requests...
              </div>
            )}
            {!equipLoading && equipError && (
              <div className="mx-6 my-4 px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium">{equipError}</div>
            )}
            {!equipLoading && !equipError && demandesEquipement.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-[#414752]">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-30">devices</span>
                <p className="font-semibold">No equipment requests found</p>
              </div>
            )}
            {!equipLoading && !equipError && demandesEquipement.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f2f4f6]/50">
                      {["ID", "Type", "Sous-Type", "Qty", "Requested By", "Observation", "Action"].map((h, i) => (
                        <th key={h} className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#414752] ${i === 6 ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef0]">
                    {pagedEquipement.map((d) => (
                      <tr
                        key={d.DEMANDE_ID}
                        className="hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                        onClick={() => setSelectedEquipement(d)}
                      >
                        <td className="px-6 py-5 text-sm font-mono font-bold text-[#944700]">#{d.DEMANDE_ID}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-[#944700]/10 flex items-center justify-center text-[#944700]">
                              <span className="material-symbols-outlined text-sm">devices</span>
                            </div>
                            <span className="text-sm font-semibold">{d.TYPE_EQUIPEMENT}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-[#191c1e]">{d.SOUS_TYPE}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#f2f4f6] text-sm font-extrabold text-[#191c1e]">
                            {d.QUANTITE}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {(d.CREATED_BY_1 || d.CREATED_BY || "?")[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{d.CREATED_BY_1 || d.CREATED_BY}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#414752] max-w-[180px] truncate">
                          {d.OBSERVATION || <span className="text-[#c1c6d4] italic">—</span>}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            className="px-3 py-1.5 text-xs font-bold text-[#944700] hover:bg-[#944700]/5 rounded-md transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedEquipement(d); }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!equipLoading && demandesEquipement.length > 0 && (
              <div className="p-6 border-t border-[#eceef0] flex justify-between items-center text-sm font-medium text-[#414752]">
                <span>
                  Showing {Math.min((equipPage - 1) * PAGE_SIZE + 1, demandesEquipement.length)}–{Math.min(equipPage * PAGE_SIZE, demandesEquipement.length)} of {demandesEquipement.length} equipment request{demandesEquipement.length !== 1 ? "s" : ""}
                </span>
                <Pagination
                  total={demandesEquipement.length}
                  page={equipPage}
                  onPageChange={setEquipPage}
                  accentColor="#944700"
                />
              </div>
            )}
          </section>

        </div>
      </main>

      {/* FAB */}
      <button
        className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        style={{ background: "linear-gradient(135deg, #005dac, #1976d2)" }}
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Status Change"
        message={`Change status to ${nextStatus}?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmStatusChange}
      />

      {/* IT Demande Details Drawer */}
      {selectedDemandeId && (
        <ITDemandeDrawer
          demandeId={selectedDemandeId}
          onClose={() => setSelectedDemandeId(null)}
          onStatusChanged={loadDemandes}
        />
      )}

      {/* Equipment Demande Drawer */}
      {selectedEquipement && (
        <EquipementDrawer
          demande={selectedEquipement}
          onClose={() => setSelectedEquipement(null)}
        />
      )}
    </div>
  );
}