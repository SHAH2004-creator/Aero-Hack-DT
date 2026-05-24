import React, { useState, useEffect } from "react";
import { FileSpreadsheet, PlusCircle, CheckCircle, Clock, AlertTriangle, ShieldCheck, RotateCcw } from "lucide-react";
import { AuditRecord } from "../types";
import { isFirebaseActive, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

interface AuditSectionProps {
  audits: AuditRecord[];
  onAddAudit: (newRecord: Omit<AuditRecord, "id" | "timestamp">) => Promise<void>;
  onResetAudits: () => Promise<void>;
  currentUserEmail: string;
}

export default function AuditSection({ audits, onAddAudit, onResetAudits, currentUserEmail }: AuditSectionProps) {
  const [componentId, setComponentId] = useState("Node-2");
  const [category, setCategory] = useState<AuditRecord["category"]>("Traveled Work");
  const [status, setStatus] = useState<AuditRecord["status"]>("Rectification Required");
  const [notes, setNotes] = useState("");
  
  // Custom MRO Compliance Form Fields
  const [inspectorId, setInspectorId] = useState(currentUserEmail || "as695853@gmail.com");
  const [shiftNumber, setShiftNumber] = useState("Shift-1");
  const [torqueValue, setTorqueValue] = useState("95.5");
  const [shimmingDeviation, setShimmingDeviation] = useState("0.02");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (currentUserEmail) {
      setInspectorId(currentUserEmail);
    }
  }, [currentUserEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !inspectorId.trim() || !shiftNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        componentId,
        category,
        status,
        notes,
        inspectorEmail: inspectorId,
        shiftNumber: shiftNumber,
        torqueValue: Number(torqueValue) || 0,
        shimmingDeviation: Number(shimmingDeviation) || 0
      };

      // Perform state submission on the fullstack REST service
      await onAddAudit(payload);

      // Symmetrically write to Firebase Firestore if fully active
      if (isFirebaseActive && db) {
        try {
          const newDoc = {
            ...payload,
            timestamp: new Date().toISOString(),
          };
          await addDoc(collection(db, "audit_records"), newDoc);
          console.log("Written compliance record to Firestore Cloud.");
        } catch (fbErr) {
          console.warn("Firestore write deferred (Local emulation state matching active):", fbErr);
        }
      }

      setNotes("");
      setSuccessMsg("MRO Digital Compliance certificate successfully logged and appended to timeline!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: AuditRecord["status"]) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded text-[10px] uppercase">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> APPROVED
          </span>
        );
      case "Rectification Required":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white border border-red-700 font-bold rounded text-[10px] uppercase">
            <AlertTriangle className="w-3 h-3 text-white" /> RECTIFICATION REQ
          </span>
        );
      case "Sealed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-bold rounded text-[10px] uppercase">
            <ShieldCheck className="w-3 h-3 text-blue-600" /> SEALED
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[10px] uppercase border border-amber-600">
            <Clock className="w-3 h-3 text-slate-950" /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xl space-y-6" id="audit_section_panel">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-slate-600" />
          <h2 className="font-bold text-slate-800 tracking-tight text-md">MRO Compliance Quality Assurance Terminal</h2>
        </div>
        
        {/* Factory Calibration Reset Button */}
        <button
          onClick={onResetAudits}
          className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 hover:text-slate-800 bg-slate-55 hover:bg-slate-100 border border-slate-200 rounded px-3 py-1.5 transition active:scale-95 bg-slate-50"
          title="Factory Calibration Reset Back to Nominal Settings"
          id="reset_audit_ledger_btn"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" /> Factory Calibration Reset
        </button>
      </div>

      {/* Grid: Form at Top (arranged nicely to look like professional aviation workstation software) */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          <h3 className="font-mono text-xs text-blue-700 font-bold uppercase tracking-wider">
            File New Digital Compliance Certificate (MRO Form Entry)
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs font-sans">
          
          {/* Nodal Component Selector */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Nodal Component Target</label>
            <select
              value={componentId}
              onChange={(e) => setComponentId(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              id="audit_component_select"
            >
              <option value="Node-1">Node-1: Rotor Bearing Assembly</option>
              <option value="Node-2">Node-2: Wing Spar Joint</option>
              <option value="Node-3">Node-3: Fuselage Mount</option>
            </select>
          </div>

          {/* Audit Category Selector */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Audit Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              id="audit_category_select"
            >
              <option value="Traveled Work">Traveled Work</option>
              <option value="Torque Compliance">Torque Compliance</option>
              <option value="Fuselage Shimming">Fuselage Shimming</option>
              <option value="Fatigue Analysis">Fatigue Analysis</option>
            </select>
          </div>

          {/* Compliance State Selector */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Compliance State</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              id="audit_status_select"
            >
              <option value="Approved">Approved</option>
              <option value="Rectification Required">Rectification Required</option>
              <option value="Pending">Pending</option>
              <option value="Sealed">Sealed</option>
            </select>
          </div>

          {/* Inspector ID Input */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Inspector ID / Email</label>
            <input
              type="text"
              value={inspectorId}
              onChange={(e) => setInspectorId(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              id="inspector_email_input"
            />
          </div>

          {/* Shift Number Input */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Shift Code / Designation</label>
            <input
              type="text"
              value={shiftNumber}
              onChange={(e) => setShiftNumber(e.target.value)}
              required
              placeholder="e.g. Shift-1"
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              id="shift_number_input"
            />
          </div>

          {/* Measured Torque Value in Nm */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Measured Torque (Nm)</label>
            <input
              type="number"
              step="0.1"
              value={torqueValue}
              onChange={(e) => setTorqueValue(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              id="torque_value_input"
            />
          </div>

          {/* Shimming Thickness Deviation Input */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Shim Deviation (mm)</label>
            <input
              type="number"
              step="0.01"
              value={shimmingDeviation}
              onChange={(e) => setShimmingDeviation(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              id="shimming_value_input"
            />
          </div>

          {/* Field Notes (Observed anomalies) */}
          <div className="md:col-span-12 space-y-1">
            <label className="text-slate-600 font-mono text-[10px] font-bold block tracking-wider uppercase">Anomalies &amp; Compliance Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Details of structural work, fasteners checked, shimming tolerances examined..."
              rows={2}
              required
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono resize-none"
              id="audit_notes_textarea"
            />
          </div>

          {/* Submit Action Button */}
          <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !notes.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-mono rounded font-bold py-2.5 px-6 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase"
              id="submit_audit_btn"
            >
              {isSubmitting ? "TRANSMITTING CERTIFICATE..." : "ARCHIVE COMPLIANCE AUDIT CERTIFICATE"}
            </button>

            {successMsg && (
              <span className="text-emerald-700 font-mono text-xs bg-emerald-50 px-3 py-1 rounded border border-emerald-250">
                {successMsg}
              </span>
            )}
          </div>

        </form>
      </div>

      {/* History Timeline Table (Placed DIRECTLY BELOW the form as requested) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-slate-500" />
          <h3 className="font-mono text-xs text-slate-700 font-bold uppercase tracking-wider">
            MRO Structural Compliance Ledger Timeline History ({audits.length})
          </h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[10px] uppercase">
                <th className="p-3">Audit ID &amp; Time</th>
                <th className="p-3">Inspector &amp; Shift</th>
                <th className="p-3">Category / Target</th>
                <th className="p-3 text-center">Quality Status</th>
                <th className="p-3 text-center">Measured Parameters</th>
                <th className="p-3">Field Notes Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">
                    No active regulatory logs found in compliance ledger database.
                  </td>
                </tr>
              ) : (
                audits.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50 transition duration-150"
                    id={`audit_timeline_row_${item.id}`}
                  >
                    
                    {/* ID and Timestamp */}
                    <td className="p-3 font-semibold whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded text-[10px] font-bold">
                          {item.id}
                        </span>
                        <div className="text-[9px] text-slate-400 font-normal">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}  {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    {/* Inspector and Shift Code */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <div className="text-slate-800 font-semibold truncate max-w-[150px]">{item.inspectorEmail}</div>
                        <div className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">
                          Shift ID: <span className="text-slate-800 font-bold">{item.shiftNumber || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category and Target */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <div className="text-slate-800 font-bold font-sans text-xs">{item.category}</div>
                        <div className="text-[10px] text-slate-500">
                          Target: <span className="text-blue-700 font-semibold">{item.componentId === "Node-1" ? "Rotor Bearing" : item.componentId === "Node-2" ? "Wing Spar Joint" : "Fuselage Mount"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Quality Status Badge */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Measured Values (Torque in Nm & Shim dev in mm) */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center bg-slate-100 border border-slate-200 rounded p-1.5 px-2.5 text-[10px] font-mono leading-tight">
                        <div className="text-slate-700">
                          Torque: <span className="text-slate-950 font-bold">{item.torqueValue !== undefined ? item.torqueValue.toFixed(1) : "N/A"}</span> <span className="text-slate-400 text-[8px]">Nm</span>
                        </div>
                        <div className="border-t border-slate-200 mt-1 pt-0.5 text-slate-700">
                          Shim Dev: <span className="text-slate-950 font-bold">{item.shimmingDeviation !== undefined ? item.shimmingDeviation.toFixed(2) : "N/A"}</span> <span className="text-slate-400 text-[8px]">mm</span>
                        </div>
                      </div>
                    </td>

                    {/* Field Notes details */}
                    <td className="p-3 font-sans text-[11px] text-slate-650 max-w-xs md:max-w-md">
                      <p className="line-clamp-3 leading-relaxed text-slate-600">{item.notes}</p>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-[9px] text-[#a0aec0] font-mono text-right flex items-center justify-between px-1">
          <span>COPERNICUS FAA LEVEL-B RELATIONAL LEDGER AUTHENTICITY BLOCK</span>
          <span className="uppercase text-slate-400">Secure Audit Feed</span>
        </div>
      </div>

    </div>
  );
}
