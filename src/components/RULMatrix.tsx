import React from "react";
import { Table, ShieldAlert, CheckCircle, Info, TrendingUp, Cpu } from "lucide-react";
import { ComponentNode } from "../types";

interface RULMatrixProps {
  nodes: ComponentNode[];
}

export default function RULMatrix({ nodes }: RULMatrixProps) {
  
  const getActionBadge = (node: ComponentNode) => {
    if (node.isFailed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100 border border-red-300 text-red-700 font-bold rounded text-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> CRITICAL REPLACEMENT
        </span>
      );
    } else if (node.stress > 40) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded text-xs">
          <Info className="w-3.5 h-3.5 text-amber-600" /> SCHEDULED WORK
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded text-xs">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> STABLE NOMINAL
        </span>
      );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xl" id="rul_matrix_panel">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-5 gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-800 tracking-tight text-md">Component Remaining Useful Life (RUL) Matrix</h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Math Model: 1/f Stress Integration Wear Interpolation
        </span>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <th className="p-3">Component ID</th>
              <th className="p-3 text-center">Calculated Stress Load</th>
              <th className="p-3 text-center">Stress Multiplier Coefficient</th>
              <th className="p-3 text-center">Calculated RUL (Hrs)</th>
              <th className="p-3">Prescriptive Maintenance Action</th>
              <th className="p-3 text-right">Verification Posture</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {nodes.map((node) => {
              // Calculate a dynamic stress multiplier factor for telemetry display, e.g., 1.00x - 3.44x
              const multiplier = (1.0 + (node.stress / 50)).toFixed(2);
              
              return (
                <tr 
                  key={node.id} 
                  className={`hover:bg-slate-100/50 transition duration-150 ${
                    node.isFailed ? "bg-red-50/50" : node.stress > 40 ? "bg-amber-50/50" : ""
                  }`}
                  id={`rul_row_${node.id}`}
                >
                  
                  {/* Column 1: Component ID & Name */}
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px] font-bold text-blue-700">
                        {node.id}
                      </span>
                      <span className="text-slate-800 font-sans font-semibold text-xs sm:text-xs">
                        {node.name}
                      </span>
                    </div>
                  </td>

                  {/* Stress Load */}
                  <td className="p-3 text-center">
                    <span className={`font-bold ${
                      node.isFailed ? "text-red-650 text-red-600" : node.stress > 40 ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {node.stress}%
                    </span>
                  </td>

                  {/* Column 2: Stress Multiplier */}
                  <td className="p-3 text-center">
                    <span className="text-slate-700 font-semibold">
                      {multiplier}x
                    </span>
                  </td>

                  {/* Column 3: Remaining Useful Life Hours */}
                  <td className="p-3 text-center">
                    <span className={`font-bold text-sm ${
                      node.isFailed ? "text-red-600" : node.stress > 40 ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {node.rulHours} <span className="text-[10px] text-slate-500 font-normal">hrs</span>
                    </span>
                  </td>

                  {/* Column 4: Prescriptive Action Required */}
                  <td className="p-3 text-left">
                    <span className={`text-[11px] font-sans ${
                      node.isFailed ? "text-red-800 font-bold" : node.stress > 40 ? "text-amber-800 font-semibold" : "text-slate-600"
                    }`}>
                      {node.action}
                    </span>
                  </td>

                  {/* Badge */}
                  <td className="p-3 text-right">
                    {getActionBadge(node)}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
