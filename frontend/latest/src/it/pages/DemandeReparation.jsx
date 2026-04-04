import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllPrestataires,
  getAllReparations,
  getAllReceptions,
  getReparationItems,
  addReparationItem,
  getPrestataireById,
  getReceptionById,
  getReparationByDemandeId,
  createPrestataire,
  createReception,
  createReparation,
} from "../services/itDemande.service";

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI helpers
// ─────────────────────────────────────────────────────────────────────────────
function Spinner({ className = "h-5 w-5" }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium flex items-center gap-2">
      <span className="material-symbols-outlined text-base">error</span>
      {message}
    </div>
  );
}

function FieldInput({ id, label, icon, type = "text", value, onChange, placeholder, required }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-[#414752]">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-lg pointer-events-none group-focus-within:text-[#005dac] transition-colors">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm font-medium focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none placeholder:text-[#717783]`}
        />
      </div>
    </div>
  );
}

function SelectField({ id, label, icon, value, onChange, disabled, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-[#414752]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-lg pointer-events-none">
            {icon}
          </span>
        )}
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-10 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] text-sm font-medium focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
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

// ─────────────────────────────────────────────────────────────────────────────
// Print Modal
// ─────────────────────────────────────────────────────────────────────────────
function PrintModal({ reparation, items, reception, prestataireName, onClose }) {
  const printRef = useRef();

  const rap = reparation || {};
  const demandeId = rap.DEMANDE_ID || rap.demande_id || rap.id;
  const structure  = rap.STRUCTURE    || rap.structure    || "—";
  const expediteur = rap.EXPEDITEUR_NAME || rap.expediteur_name || "—";
  const printedAt  = new Date().toLocaleString("fr-DZ");

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Demande Réparation #${demandeId}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 12px;
            color: #191c1e;
            background: #fff;
            padding: 0;
          }

          /* ── Page layout ── */
          .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 14mm 16mm 14mm 16mm; }

          /* ── Header ── */
          .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #005dac; padding-bottom: 10px; margin-bottom: 18px; }
          .org-block .org-name { font-size: 15px; font-weight: 800; color: #005dac; letter-spacing: -0.5px; }
          .org-block .org-sub  { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #717783; margin-top: 2px; }
          .doc-title-block { text-align: right; }
          .doc-title-block .doc-title { font-size: 13px; font-weight: 700; color: #191c1e; }
          .doc-title-block .doc-ref   { font-size: 11px; font-weight: 800; color: #005dac; font-family: monospace; margin-top: 3px; }
          .doc-title-block .doc-date  { font-size: 9px; color: #717783; margin-top: 3px; }

          /* ── Section titles ── */
          .section-title {
            font-size: 9px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 2px; color: #005dac;
            border-left: 3px solid #005dac; padding-left: 7px;
            margin: 18px 0 8px 0;
          }

          /* ── Info grid ── */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e0e3e5; border-radius: 6px; overflow: hidden; }
          .info-row  { display: flex; border-bottom: 1px solid #eceef0; }
          .info-row:last-child { border-bottom: none; }
          .info-label { width: 38%; padding: 7px 10px; background: #f8f9fb; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #414752; border-right: 1px solid #eceef0; }
          .info-value { flex: 1; padding: 7px 10px; font-size: 11px; font-weight: 500; color: #191c1e; }
          .info-value.mono { font-family: monospace; font-weight: 700; color: #005dac; }

          /* ── Full-width info table ── */
          .info-table { width: 100%; border-collapse: collapse; border: 1px solid #e0e3e5; border-radius: 6px; overflow: hidden; }
          .info-table td { padding: 7px 10px; border-bottom: 1px solid #eceef0; }
          .info-table tr:last-child td { border-bottom: none; }
          .info-table .lbl { width: 30%; background: #f8f9fb; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #414752; border-right: 1px solid #eceef0; }
          .info-table .val { font-size: 11px; font-weight: 500; }
          .info-table .mono { font-family: monospace; font-weight: 700; color: #005dac; }

          /* ── Items table ── */
          .items-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .items-table th { background: #f2f4f6; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #414752; padding: 7px 10px; text-align: left; border-bottom: 2px solid #e0e3e5; }
          .items-table td { padding: 7px 10px; font-size: 11px; border-bottom: 1px solid #eceef0; vertical-align: top; }
          .items-table tr:last-child td { border-bottom: none; }
          .items-table .eq-code { font-family: monospace; font-size: 10px; color: #005dac; font-weight: 700; }
          .items-table .problem { color: #414752; font-size: 10px; }

          /* ── Reception block ── */
          .reception-block { border: 1px solid #c8e6c9; border-radius: 6px; overflow: hidden; margin-top: 8px; }
          .reception-header { background: #e8f5e9; padding: 7px 10px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #2e7d32; display: flex; align-items: center; gap: 6px; }
          .reception-header::before { content: "✓"; font-size: 11px; font-weight: 900; }
          .conform-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; }
          .conform-yes { background: #e8f5e9; color: #2e7d32; }
          .conform-no  { background: #ffeee5; color: #c62828; }

          /* ── Signature area ── */
          .sig-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; }
          .sig-box { border-top: 1px solid #c1c6d4; padding-top: 8px; }
          .sig-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #414752; }
          .sig-name  { font-size: 10px; color: #191c1e; margin-top: 3px; }
          .sig-space { height: 40px; }

          /* ── Footer ── */
          .doc-footer { position: fixed; bottom: 10mm; left: 16mm; right: 16mm; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eceef0; padding-top: 5px; }
          .doc-footer .footer-left  { font-size: 8px; color: #717783; }
          .doc-footer .footer-right { font-size: 8px; color: #717783; }
          .page-num::after { content: counter(page); }
          @counter-style { counter-reset: page; }

          /* ── No-print items ── */
          .no-print { display: none !important; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 10mm 14mm; }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const isConform = (reception?.IS_CONFORM || reception?.is_conform) === "Y";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col pointer-events-auto">

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#eceef0]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#005dac]/10 flex items-center justify-center text-[#005dac]">
                <span className="material-symbols-outlined text-xl">print</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">Print Preview</p>
                <h3 className="text-base font-extrabold tracking-tight text-[#191c1e]">Demande Réparation #{demandeId}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#414752] hover:bg-[#f2f4f6] transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-y-auto bg-[#f2f4f6] p-6">
            <div className="bg-white rounded-xl shadow-sm mx-auto" style={{ maxWidth: "680px" }}>

              {/* ── Hidden printable content ── */}
              <div ref={printRef}>
                <div className="page" style={{ padding: "32px 40px", fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "12px", color: "#191c1e" }}>

                  {/* Header */}
                  <div className="doc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #005dac", paddingBottom: "12px", marginBottom: "20px" }}>
                    <div className="org-block">
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "#005dac", letterSpacing: "-0.5px" }}>ENCC IT Service Desk</div>
                      <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "2px", color: "#717783", marginTop: "3px" }}>ITSM Precision Ecosystem</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>Demande de Réparation</div>
                      <div style={{ fontSize: "12px", fontWeight: "800", color: "#005dac", fontFamily: "monospace", marginTop: "3px" }}>#{demandeId}</div>
                      <div style={{ fontSize: "9px", color: "#717783", marginTop: "3px" }}>Imprimé le : {printedAt}</div>
                    </div>
                  </div>

                  {/* Section: Informations générales */}
                  <div style={{ fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "2px", color: "#005dac", borderLeft: "3px solid #005dac", paddingLeft: "8px", margin: "0 0 10px 0" }}>
                    Informations Générales
                  </div>
                  <table className="info-table" style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e0e3e5" }}>
                    <tbody>
                      {[
                        { label: "N° Demande",    value: `#${demandeId}`, mono: true },
                        { label: "Structure",      value: structure },
                        { label: "Expéditeur",     value: expediteur },
                        { label: "Prestataire",    value: prestataireName || "Non assigné" },
                      ].map(({ label, value, mono }) => (
                        <tr key={label}>
                          <td className="lbl" style={{ width: "30%", background: "#f8f9fb", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#414752", padding: "8px 10px", borderBottom: "1px solid #eceef0", borderRight: "1px solid #eceef0" }}>{label}</td>
                          <td className={mono ? "mono" : ""} style={{ padding: "8px 10px", fontSize: "11px", fontWeight: "500", borderBottom: "1px solid #eceef0", ...(mono ? { fontFamily: "monospace", fontWeight: "700", color: "#005dac" } : {}) }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Section: Articles */}
                  <div style={{ fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "2px", color: "#005dac", borderLeft: "3px solid #005dac", paddingLeft: "8px", margin: "20px 0 10px 0" }}>
                    Articles à Réparer ({items.length})
                  </div>
                  {items.length === 0 ? (
                    <div style={{ padding: "14px", background: "#f8f9fb", border: "1px solid #eceef0", borderRadius: "4px", fontSize: "11px", color: "#717783", textAlign: "center" }}>
                      Aucun article enregistré
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e0e3e5" }}>
                      <thead>
                        <tr>
                          {["#", "Désignation", "Code Équipement", "Problème constaté"].map((h, i) => (
                            <th key={h} style={{ background: "#f2f4f6", fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#414752", padding: "7px 10px", textAlign: "left", borderBottom: "2px solid #e0e3e5", borderRight: i < 3 ? "1px solid #e0e3e5" : "none" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={item.ITEM_ID || item.id || i} style={{ borderBottom: "1px solid #eceef0" }}>
                            <td style={{ padding: "7px 10px", fontSize: "10px", color: "#717783", width: "28px", borderRight: "1px solid #eceef0" }}>{i + 1}</td>
                            <td style={{ padding: "7px 10px", fontSize: "11px", fontWeight: "600", borderRight: "1px solid #eceef0" }}>{item.DESIGNATION || item.designation || "—"}</td>
                            <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: "10px", color: "#005dac", fontWeight: "700", borderRight: "1px solid #eceef0" }}>{item.EQUIPMENT_CODE || item.equipment_code || "—"}</td>
                            <td style={{ padding: "7px 10px", fontSize: "10px", color: "#414752" }}>{item.PROBLEM || item.problem || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Section: Réception */}
                  {reception && (
                    <>
                      <div style={{ fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "2px", color: "#2e7d32", borderLeft: "3px solid #2e7d32", paddingLeft: "8px", margin: "20px 0 10px 0" }}>
                        Réception / Résultat
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #c8e6c9" }}>
                        <thead>
                          <tr>
                            <th style={{ background: "#e8f5e9", padding: "7px 10px", fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#2e7d32", textAlign: "left", borderBottom: "1px solid #c8e6c9", borderRight: "1px solid #c8e6c9" }}>Coût (DA)</th>
                            <th style={{ background: "#e8f5e9", padding: "7px 10px", fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#2e7d32", textAlign: "left", borderBottom: "1px solid #c8e6c9", borderRight: "1px solid #c8e6c9" }}>Durée (jours)</th>
                            <th style={{ background: "#e8f5e9", padding: "7px 10px", fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#2e7d32", textAlign: "left", borderBottom: "1px solid #c8e6c9" }}>Conformité</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: "8px 10px", fontSize: "12px", fontWeight: "700", borderRight: "1px solid #c8e6c9" }}>{reception.COST_DA || reception.cost_da || "—"} DA</td>
                            <td style={{ padding: "8px 10px", fontSize: "12px", fontWeight: "700", borderRight: "1px solid #c8e6c9" }}>{reception.REPAIR_DURATION_DAYS || reception.repair_duration_days || "—"} jours</td>
                            <td style={{ padding: "8px 10px" }}>
                              <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", background: isConform ? "#e8f5e9" : "#ffeee5", color: isConform ? "#2e7d32" : "#c62828" }}>
                                {isConform ? "✓ Conforme" : "✗ Non-Conforme"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {(reception.OBSERVATION || reception.observation) && (
                        <div style={{ marginTop: "8px", padding: "10px", background: "#f8f9fb", border: "1px solid #eceef0", borderRadius: "4px", fontSize: "11px", color: "#414752" }}>
                          <span style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px" }}>Observation : </span>
                          {reception.OBSERVATION || reception.observation}
                        </div>
                      )}
                    </>
                  )}

                  {/* Signature area */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "36px" }}>
                    {["Expéditeur", "Prestataire"].map((role) => (
                      <div key={role} style={{ borderTop: "1px solid #c1c6d4", paddingTop: "8px" }}>
                        <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#414752" }}>{role}</div>
                        <div style={{ height: "40px" }} />
                        <div style={{ borderTop: "1px dashed #c1c6d4", paddingTop: "4px", fontSize: "9px", color: "#717783" }}>Signature & Cachet</div>
                      </div>
                    ))}
                  </div>

                  {/* Page footer */}
                  <div style={{ marginTop: "32px", paddingTop: "8px", borderTop: "1px solid #eceef0", display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#717783" }}>
                    <span>ENCC IT Service Desk — Document officiel</span>
                    <span>Réf : #{demandeId} — {printedAt}</span>
                  </div>

                </div>
              </div>
              {/* End printable content */}
            </div>
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-[#eceef0] bg-[#f8f9fb] flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #005dac, #1976d2)" }}
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print / Save as PDF
            </button>
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-[#c1c6d4] text-sm font-semibold text-[#414752] hover:bg-[#e6e8ea] transition-colors">
              Cancel
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate }) {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-slate-100 p-4 overflow-y-auto font-['Inter'] tracking-tight shrink-0">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-full bg-[#e6e8ea] flex items-center justify-center">
          <img src="../src/assets/logoencc.png" alt="Logo" className="w-16 h-10" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tighter">ENCC IT Service Desk</h1>
        </div>
      </div>

      <nav className="space-y-1">
        <button
          onClick={() => onNavigate("list")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] font-semibold
            ${activePage === "list" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <span className="material-symbols-outlined text-xl">handyman</span>
          <span className="text-sm">Réparations</span>
        </button>

        <button
          onClick={() => onNavigate("create")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] font-semibold
            ${activePage === "create" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span className="text-sm">New Réparation</span>
        </button>

        <button
          onClick={() => onNavigate("prestataire")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] font-semibold
            ${activePage === "prestataire" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <span className="material-symbols-outlined text-xl">engineering</span>
          <span className="text-sm">Add Prestataire</span>
        </button>
      </nav>

      <div className="mt-auto pt-8">
        <div className="bg-slate-200/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6e8ea] flex items-center justify-center text-xs font-bold text-[#005dac]">IT</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">IT Admin</p>
            <p className="text-xs text-slate-500 truncate">System Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header className="flex justify-between items-center h-16 px-8 w-full sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm z-40">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="w-full bg-[#f2f4f6] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
            placeholder="Search réparations..."
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

// ─────────────────────────────────────────────────────────────────────────────
// Reparation Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────
function ReparationDrawer({ reparation, prestataires, onClose, onRefresh }) {
  const [items, setItems] = useState([]);
  const [reception, setReception] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add item form
  const [newItem, setNewItem] = useState({ designation: "", equipment_code: "", problem: "" });
  const [addingItem, setAddingItem] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  // Receipt form
  const [receptionForm, setReceptionForm] = useState({
    cost_da: "", repair_duration_days: "", is_conform: "Y", observation: ""
  });
  const [submittingReception, setSubmittingReception] = useState(false);
  const [showReceptionForm, setShowReceptionForm] = useState(false);

  // Print
  const [showPrint, setShowPrint] = useState(false);

  const prestataireName = prestataires.find(
    (p) => p.prestataire_id === reparation?.prestataire_id || p.PRESTATAIRE_ID === reparation?.prestataire_id
  )?.name || prestataires.find(
    (p) => p.prestataire_id === reparation?.PRESTATAIRE_ID || p.PRESTATAIRE_ID === reparation?.PRESTATAIRE_ID
  )?.NAME || reparation?.PRESTATAIRE_ID || "—";

  useEffect(() => {
    if (!reparation) return;
    setLoading(true);
    const id = reparation.DEMANDE_ID || reparation.demande_id || reparation.id;
    Promise.all([
      getReparationItems(id).catch(() => []),
      getReceptionById(id).catch(() => null),
    ])
      .then(([itemsData, receptionData]) => {
        setItems(itemsData || []);
        setReception(receptionData);
      })
      .catch(() => setError("Failed to load details"))
      .finally(() => setLoading(false));
  }, [reparation]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.designation) return;
    setAddingItem(true);
    setError("");
    try {
      const id = reparation.DEMANDE_ID || reparation.demande_id || reparation.id;
      await addReparationItem(id, newItem);
      const updated = await getReparationItems(id);
      setItems(updated);
      setNewItem({ designation: "", equipment_code: "", problem: "" });
      setShowAddItem(false);
    } catch {
      setError("Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  const handleCreateReception = async (e) => {
    e.preventDefault();
    setSubmittingReception(true);
    setError("");
    try {
      const id = reparation.DEMANDE_ID || reparation.demande_id || reparation.id;
      console.log(id, receptionForm);
      console.log("Creating reception with data:", receptionForm);
      await createReception({
        demandeId : id,
        cost_da: Number(receptionForm.cost_da),
        repair_duration_days: Number(receptionForm.repair_duration_days),
        is_conform: receptionForm.is_conform,
        observation: receptionForm.observation || null,
      });
      const updated = await getReceptionById(id).catch(() => null);
      setReception(updated);
      setShowReceptionForm(false);
      onRefresh();
    } catch (err) {
      setError(err?.message || "Failed to create reception. Make sure a prestataire is assigned.");
    } finally {
      setSubmittingReception(false);
    }
  };

  const rap = reparation || {};
  const demandeId = rap.DEMANDE_ID || rap.demande_id || rap.id;

  const FIELD_ROWS = [
    { label: "Demande ID",   value: `#${demandeId}`,                       mono: true },
    { label: "Structure",    value: rap.STRUCTURE || rap.structure || "—"              },
    { label: "Expéditeur",   value: rap.EXPEDITEUR_NAME || rap.expediteur_name || "—" },
    { label: "Prestataire",  value: prestataireName                                    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eceef0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#005dac]/10 flex items-center justify-center text-[#005dac]">
              <span className="material-symbols-outlined text-xl">handyman</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">Réparation Details</p>
              <h3 className="text-lg font-extrabold tracking-tight text-[#191c1e] mt-0.5">#{demandeId}</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#414752] hover:bg-[#f2f4f6] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-20 text-[#414752]">
              <Spinner className="h-5 w-5 mr-3 text-[#005dac]" />
              Loading…
            </div>
          )}

          {!loading && (
            <>
              <ErrorBanner message={error} />

              {/* Info fields */}
              <div className="bg-white border border-[#eceef0] rounded-xl divide-y divide-[#eceef0] overflow-hidden">
                {FIELD_ROWS.map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#414752] w-28 shrink-0">{label}</span>
                    <span className={`text-sm text-right text-[#191c1e] ${mono ? "font-mono font-bold text-[#005dac]" : "font-medium"}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* ── Items ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">
                    Items ({items.length})
                  </p>
                  <button
                    onClick={() => setShowAddItem((o) => !o)}
                    className="flex items-center gap-1 text-xs font-bold text-[#005dac] hover:bg-[#005dac]/5 px-2 py-1 rounded-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">{showAddItem ? "remove" : "add"}</span>
                    {showAddItem ? "Cancel" : "Add Item"}
                  </button>
                </div>

                {/* Add item form */}
                {showAddItem && (
                  <form onSubmit={handleAddItem} className="bg-[#f2f4f6] rounded-xl p-4 space-y-3 mb-3">
                    <FieldInput
                      id="designation" label="Designation" icon="label"
                      value={newItem.designation} onChange={(e) => setNewItem((p) => ({ ...p, designation: e.target.value }))}
                      placeholder="e.g. Pompe hydraulique" required
                    />
                    <FieldInput
                      id="eq_code" label="Equipment Code" icon="qr_code"
                      value={newItem.equipment_code} onChange={(e) => setNewItem((p) => ({ ...p, equipment_code: e.target.value }))}
                      placeholder="e.g. PMP-001"
                    />
                    <FieldInput
                      id="cout" label="Cost" icon="attach_money"
                      value={newItem.cout} onChange={(e) => setNewItem((p) => ({ ...p, cout: e.target.value }))}
                      placeholder="e.g. 1000"
                    />
                    <FieldInput
                      id="problem" label="Problem" icon="report_problem"
                      value={newItem.problem} onChange={(e) => setNewItem((p) => ({ ...p, problem: e.target.value }))}
                      placeholder="Describe the issue"
                    />
                    <button
                      type="submit"
                      disabled={addingItem || !newItem.designation}
                      className="w-full py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #005dac, #1976d2)" }}
                    >
                      {addingItem ? <><Spinner className="h-4 w-4" />Adding…</> : <><span className="material-symbols-outlined text-sm">add</span>Add Item</>}
                    </button>
                  </form>
                )}

                {/* Items list */}
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-[#414752] bg-[#f8f9fb] rounded-xl border border-[#eceef0]">
                    <span className="material-symbols-outlined text-3xl mb-2 opacity-30">inventory_2</span>
                    <p className="text-sm font-semibold">No items yet</p>
                    <p className="text-xs mt-0.5">Add items using the button above</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={item.ITEM_ID || item.id || i} className="bg-[#f8f9fb] border border-[#eceef0] rounded-xl px-4 py-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#191c1e]">{item.DESIGNATION || item.designation}</span>
                          <div>
                          <span className="text-xs text-[#717783] font-bold">{item.COUT ? `${item.COUT} DA` : ""}</span>
                          <span className="text-xs font-mono text-[#005dac] font-bold">{item.EQUIPMENT_CODE || item.equipment_code}</span>
                          </div>
                        </div>
                        {(item.PROBLEM || item.problem) && (
                          <p className="text-xs text-[#414752]">{item.PROBLEM || item.problem}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Reception ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#414752]">Reception</p>
                  {!reception && (
                    <button
                      onClick={() => setShowReceptionForm((o) => !o)}
                      className="flex items-center gap-1 text-xs font-bold text-green-700 hover:bg-green-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">{showReceptionForm ? "remove" : "add"}</span>
                      {showReceptionForm ? "Cancel" : "Add Reception"}
                    </button>
                  )}
                </div>

                {/* Reception form */}
                {!reception && showReceptionForm && (
                  <form onSubmit={handleCreateReception} className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3 mb-3">
                    <p className="text-xs text-[#414752]">A prestataire must be assigned before saving a reception.</p>
                    <div className="grid grid-cols-2 gap-3">
                      {/* <FieldInput
                        id="cost" label="Cost (DA)" icon="payments" type="number"
                        value={receptionForm.cost_da} onChange={(e) => setReceptionForm((p) => ({ ...p, cost_da: e.target.value }))}
                        placeholder="e.g. 100000" required
                      /> */}
                      <FieldInput
                        id="duration" label="Duration (days)" icon="schedule" type="number"
                        value={receptionForm.repair_duration_days} onChange={(e) => setReceptionForm((p) => ({ ...p, repair_duration_days: e.target.value }))}
                        placeholder="e.g. 3" required
                      />
                    </div>
                    <SelectField
                      id="conform" label="Conformité" icon="verified"
                      value={receptionForm.is_conform} onChange={(e) => setReceptionForm((p) => ({ ...p, is_conform: e.target.value }))}
                    >
                      <option value="Y">✓ Conforme</option>
                      <option value="N">✗ Non-Conforme</option>
                    </SelectField>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#414752]">
                        Observation <span className="normal-case font-normal text-[#717783]">— optional</span>
                      </label>
                      <textarea
                        rows={3}
                        value={receptionForm.observation}
                        onChange={(e) => setReceptionForm((p) => ({ ...p, observation: e.target.value }))}
                        placeholder="Any remarks…"
                        className="w-full px-4 py-3 bg-white border-0 rounded-lg text-[#191c1e] text-sm placeholder:text-[#717783] focus:ring-1 focus:ring-green-500 outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReception || !receptionForm.repair_duration_days}
                      className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReception ? <><Spinner className="h-4 w-4" />Saving…</> : <><span className="material-symbols-outlined text-sm">save</span>Save Reception</>}
                    </button>
                  </form>
                )}

                {/* Reception details */}
                {reception ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl divide-y divide-green-100 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-100/50">
                      <span className="material-symbols-outlined text-green-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-green-700">Reception Validated (Immutable)</span>
                    </div>
                    {[
                      { label: "Cost",       value: `${reception.COST_DA || reception.cost_da || "—"} DA` },
                      { label: "Duration",   value: `${reception.REPAIR_DURATION_DAYS || reception.repair_duration_days || "—"} days` },
                      { label: "Conformité", value: (reception.IS_CONFORM || reception.is_conform) === "Y" ? "✓ Conforme" : "✗ Non-Conforme" },
                      { label: "Observation", value: reception.OBSERVATION || reception.observation || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-700 w-28 shrink-0">{label}</span>
                        <span className="text-sm font-medium text-[#191c1e] text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : !showReceptionForm ? (
                  <div className="flex flex-col items-center justify-center py-8 text-[#414752] bg-[#f8f9fb] rounded-xl border border-[#eceef0]">
                    <span className="material-symbols-outlined text-3xl mb-2 opacity-30">receipt_long</span>
                    <p className="text-sm font-semibold">No reception yet</p>
                    <p className="text-xs mt-0.5">Reception is locked once submitted</p>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#eceef0] bg-[#f8f9fb] flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            disabled={loading || !!error}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-[#005dac] hover:bg-[#005dac]/5 border border-[#005dac]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print PDF
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[#c1c6d4] text-sm font-semibold text-[#414752] hover:bg-[#e6e8ea] transition-colors">
            Close
          </button>
        </div>
      </div>

      {/* Print Modal */}
      {showPrint && (
        <PrintModal
          reparation={reparation}
          items={items}
          reception={reception}
          prestataireName={prestataireName}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page: List Reparations
// ─────────────────────────────────────────────────────────────────────────────
function ReparationList({ prestataires, onNavigate }) {
  const [reparations, setReparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllReparations();
      setReparations(data);
    } catch {
      setError("Failed to load réparations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalPages = Math.ceil(reparations.length / PAGE_SIZE);
  const paged = reparations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getPrestataireName = (rap) => {
return rap.PRESTATAIRE ;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#414752] mb-1">IT Operations</p>
          <h2 className="text-3xl font-extrabold tracking-tighter text-[#191c1e]">Réparations</h2>
        </div>
        <button
          onClick={() => onNavigate("create")}
          className="px-6 py-2.5 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #005dac, #1976d2)" }}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Réparation
        </button>
      </div>

      <section className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] overflow-hidden">
        <div className="p-6 flex items-center justify-between bg-[#f2f4f6]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#005dac]/10 flex items-center justify-center text-[#005dac]">
              <span className="material-symbols-outlined text-lg">handyman</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">All Réparations</h3>
          </div>
          <button onClick={load} className="p-2 text-[#414752] hover:bg-[#e6e8ea] rounded-md transition-colors" title="Refresh">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-[#414752]">
            <Spinner className="h-5 w-5 mr-3 text-[#005dac]" />
            Loading réparations…
          </div>
        )}
        {!loading && error && <div className="mx-6 my-4"><ErrorBanner message={error} /></div>}
        {!loading && !error && reparations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-[#414752]">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">handyman</span>
            <p className="font-semibold">No réparations found</p>
            <p className="text-xs mt-1">Create one using the button above</p>
          </div>
        )}

        {!loading && !error && reparations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]/50">
                  {["ID", "Structure", "Expéditeur", "Prestataire", "Reception", "Action"].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#414752] ${i === 6 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {paged.map((rap) => {
                  const id = rap.DEMANDE_ID || rap.demande_id || rap.id;
                  const preName = getPrestataireName(rap);
                  return (
                    <tr
                      key={id}
                      className="hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                      onClick={() => setSelected(rap)}
                    >
                      <td className="px-6 py-5 text-sm font-mono font-bold text-[#005dac]">#{id}</td>
                      <td className="px-6 py-5 text-sm font-semibold">{rap.STRUCTURE || rap.structure || "—"}</td>
                      <td className="px-6 py-5 text-sm font-medium">{rap.EXPEDITEUR_NAME || rap.expediteur_name || "—"}</td>
                      <td className="px-6 py-5">
                        {preName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#005dac]/8 text-[#005dac] text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">engineering</span>
                            {preName}
                          </span>
                        ) : (
                          <span className="text-xs text-[#717783] italic">Not assigned</span>
                        )}
                      </td>
                     
                      <td className="px-6 py-5">
                        {rap.reception_id || rap.RECEPTION_ID ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 border-l-2 border-green-500 text-green-700 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#ffdbc7] border-l-2 border-[#944700] text-[#311300] text-xs font-bold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          className="px-3 py-1.5 text-xs font-bold text-[#005dac] hover:bg-[#005dac]/5 rounded-md transition-colors"
                          onClick={(e) => { e.stopPropagation(); setSelected(rap); }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && reparations.length > 0 && (
          <div className="p-6 border-t border-[#eceef0] flex justify-between items-center text-sm font-medium text-[#414752]">
            <span>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, reparations.length)}–{Math.min(page * PAGE_SIZE, reparations.length)} of {reparations.length}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-[#c1c6d4]/50 text-[#414752] hover:bg-[#f2f4f6] disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${p === page ? "text-white" : "border border-[#c1c6d4]/50 text-[#414752] hover:bg-[#f2f4f6]"}`}
                    style={p === page ? { background: "linear-gradient(135deg, #005dac, #1976d2)" } : {}}
                  >
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-[#c1c6d4]/50 text-[#414752] hover:bg-[#f2f4f6] disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {selected && (
        <ReparationDrawer
          reparation={selected}
          prestataires={prestataires}
          onClose={() => setSelected(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page: Create Reparation
// ─────────────────────────────────────────────────────────────────────────────
function CreateReparation({ prestataires, onNavigate }) {
  const [form, setForm] = useState({ id: "", structure: "", expediteur_name: "", prestataire_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id || !form.structure || !form.expediteur_name) {
      setError("Demande ID, Structure and Expéditeur are required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createReparation({
        id: form.id,
        structure: form.structure,
        expediteur_name: form.expediteur_name,
        prestataire_id: form.prestataire_id || null,
      });
      setSuccess(true);
      setTimeout(() => onNavigate("list"), 1500);
    } catch {
      setError("Failed to create réparation. Check that the Demande ID exists.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <button
          onClick={() => onNavigate("list")}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#414752] hover:text-[#005dac] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Réparations
        </button>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#005dac]/10 flex items-center justify-center text-[#005dac]">
            <span className="material-symbols-outlined text-xl">handyman</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">New Réparation</h2>
        </div>
        <p className="text-[#414752] mt-1 ml-12">Create a new repair request linked to an existing demande.</p>
      </div>

      <div className="max-w-2xl">
        {success && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Réparation created! Redirecting…
          </div>
        )}
        <ErrorBanner message={error} />

        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] overflow-hidden mt-4">
          <div className="px-6 py-5 border-b border-[#eceef0] bg-[#f2f4f6]/30">
            <h3 className="text-base font-bold tracking-tight text-[#191c1e]">Réparation Details</h3>
            <p className="text-xs text-[#414752] mt-0.5">ID, Structure and Expéditeur are required</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldInput
                id="rap_id" label="Demande ID" icon="tag"
                value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
                placeholder="e.g. 2001" required
              />
              <FieldInput
                id="structure" label="Structure" icon="business"
                value={form.structure} onChange={(e) => setForm((p) => ({ ...p, structure: e.target.value }))}
                placeholder="e.g. Production" required
              />
            </div>

            <FieldInput
              id="expediteur" label="Expéditeur Name" icon="person"
              value={form.expediteur_name} onChange={(e) => setForm((p) => ({ ...p, expediteur_name: e.target.value }))}
              placeholder="e.g. Ahmed Benali" required
            />

            <SelectField
              id="prestataire" label="Prestataire" icon="engineering"
              value={form.prestataire_id} onChange={(e) => setForm((p) => ({ ...p, prestataire_id: e.target.value }))}
            >
              <option value="">— Optional: Assign later —</option>
              {prestataires.map((p) => (
                <option key={p.PRESTATAIRE_ID || p.prestataire_id} value={p.PRESTATAIRE_ID || p.prestataire_id}>
                  {p.NAME || p.name}
                </option>
              ))}
            </SelectField>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #005dac, #1976d2)" }}
              >
                {submitting ? <><Spinner className="h-4 w-4" />Creating…</> : <><span className="material-symbols-outlined text-sm">save</span>Create Réparation</>}
              </button>
              <button type="button" onClick={() => onNavigate("list")} className="px-6 py-3 rounded-lg border border-[#c1c6d4] text-sm font-semibold text-[#414752] hover:bg-[#e6e8ea] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page: Add Prestataire
// ─────────────────────────────────────────────────────────────────────────────
function AddPrestataire({ onNavigate, onRefreshPrestataires }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError("Name is required"); return; }
    setSubmitting(true);
    setError("");
    try {
      await createPrestataire({ name: form.name, phone: form.phone, email: form.email });
      setSuccess(true);
      onRefreshPrestataires();
      setTimeout(() => { setSuccess(false); setForm({ name: "", phone: "", email: "" }); }, 2000);
    } catch {
      setError("Failed to create prestataire");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <button
          onClick={() => onNavigate("list")}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#414752] hover:text-[#005dac] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Réparations
        </button>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#944700]/10 flex items-center justify-center text-[#944700]">
            <span className="material-symbols-outlined text-xl">engineering</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">Add Prestataire</h2>
        </div>
        <p className="text-[#414752] mt-1 ml-12">Register a new repair service provider.</p>
      </div>

      <div className="max-w-2xl">
        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Prestataire created successfully!
          </div>
        )}
        <ErrorBanner message={error} />

        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] overflow-hidden mt-4">
          <div className="px-6 py-5 border-b border-[#eceef0] bg-[#f2f4f6]/30">
            <h3 className="text-base font-bold tracking-tight text-[#191c1e]">Prestataire Information</h3>
            <p className="text-xs text-[#414752] mt-0.5">Name is required</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <FieldInput
              id="pre_name" label="Company Name" icon="business"
              value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. SARL FixTech" required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldInput
                id="pre_phone" label="Phone" icon="phone" type="tel"
                value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 0555123456"
              />
              <FieldInput
                id="pre_email" label="Email" icon="mail" type="email"
                value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. contact@fixtech.dz"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #944700, #ba5b00)" }}
              >
                {submitting ? <><Spinner className="h-4 w-4" />Creating…</> : <><span className="material-symbols-outlined text-sm">add</span>Add Prestataire</>}
              </button>
              <button type="button" onClick={() => onNavigate("list")} className="px-6 py-3 rounded-lg border border-[#c1c6d4] text-sm font-semibold text-[#414752] hover:bg-[#e6e8ea] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function DemandeReparation() {
  const [activePage, setActivePage] = useState("list");
  const [prestataires, setPrestataires] = useState([]);
  const [error, setError] = useState("");

  const loadPrestataires = async () => {
    try {
      const data = await getAllPrestataires();
      setPrestataires(data);
    } catch {
      setError("Failed to load prestataires");
    }
  };

  useEffect(() => { loadPrestataires(); }, []);

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] flex min-h-screen overflow-hidden font-['Inter',sans-serif]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          {activePage === "list" && (
            <ReparationList prestataires={prestataires} onNavigate={setActivePage} />
          )}
          {activePage === "create" && (
            <CreateReparation prestataires={prestataires} onNavigate={setActivePage} />
          )}
          {activePage === "prestataire" && (
            <AddPrestataire onNavigate={setActivePage} onRefreshPrestataires={loadPrestataires} />
          )}
        </div>
      </main>
    </div>
  );
}