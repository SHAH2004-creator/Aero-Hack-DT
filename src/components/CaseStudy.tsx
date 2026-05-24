import React from "react";
import { AlertCircle, BookOpen, CheckSquare, ShieldCheck } from "lucide-react";

export default function CaseStudy() {
  return (
    <div className="bg-white border-l-4 border-amber-500 border-y border-r border-slate-200 rounded-r-xl p-5 shadow-xl flex flex-col justify-between h-full" id="case_study_panel">
      
      <div className="space-y-4">
        {/* Title Callout */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-800 tracking-tight text-md">Aviation Quality Assurance &amp; Structural Compliance</h2>
        </div>

        {/* Detailed Case Summary */}
        <div className="bg-slate-55 p-4 rounded border border-slate-200 bg-slate-50 space-y-3 font-sans">
          <p className="text-xs text-slate-600 leading-relaxed">
            Unchecked component micro-stress and unvetted <strong className="text-amber-800">"traveled work"</strong> structural discrepancies (as documented in recent global Boeing quality system audits and fuselage shimming compliance investigations) represent a catastrophic failure mode on active flight lines. Traveled work refers to tasks performed out of their optimal sequence during final assembly, which frequently breeds latent mechanical assembly issues.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            By implementing <strong className="text-blue-700">continuous micro-stress tracking</strong>, inspectors can catch shimming gap deviations and torque discrepancies before aircraft skins are sealed. Real-time digital twins provide clear, non-destructive monitoring, mapping physical stress propagation directly to predictive remaining useful life equations.
          </p>
        </div>

        {/* Audit Compliance Bulletins */}
        <div className="space-y-2">
          <h3 className="font-mono text-[11px] text-amber-800 font-bold flex items-center gap-1 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Grounding Compliance Safeguards
          </h3>
          
          <div className="space-y-2 text-[11px] font-mono text-slate-600">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-800 block text-[10px] uppercase tracking-wider">Traveled Work Elimination</strong>
                Guarantees all fasteners are mathematically routed and tracked through transition shifts before component sealing authorization.
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-800 block text-[10px] uppercase tracking-wider">Fuselage Shim Calibration</strong>
                Ensures shimming gaps are dynamically audited using laser micron checks to prevent micro-fatigue under aerodynamic loads.
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Part 25 MRO Trace Verified
        </span>
        <span className="uppercase">AeroShield advisory</span>
      </div>

    </div>
  );
}
