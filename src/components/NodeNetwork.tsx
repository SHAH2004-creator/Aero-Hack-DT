import React from "react";
import { Network, ArrowRightCircle, Activity, ShieldCheck, ShieldAlert, ArrowDown, HelpCircle } from "lucide-react";
import { ComponentNode } from "../types";

interface NodeNetworkProps {
  nodes: ComponentNode[];
}

export default function NodeNetwork({ nodes }: NodeNetworkProps) {
  
  // Style and color helpers depending on stress levels and failure states
  const getNodeStyles = (node: ComponentNode) => {
    if (node.isFailed) {
      return {
        border: "border-red-600 bg-red-50/70 shadow-[0_2px_8px_rgba(220,38,38,0.06)]",
        badge: "bg-red-600 text-white border-red-700 font-bold uppercase",
        pill: "bg-white animate-pulse",
        text: "text-red-700 font-bold",
        bar: "bg-red-600",
        label: "CRITICAL FAILURE",
        progressBg: "bg-red-100"
      };
    } else if (node.status === "Elevated Stress") {
      return {
        border: "border-amber-400 bg-amber-50/70 shadow-[0_2px_8px_rgba(245,158,11,0.05)]",
        badge: "bg-amber-500 text-slate-950 border-amber-600 font-bold uppercase",
        pill: "bg-slate-950 animate-pulse",
        text: "text-amber-700 font-bold",
        bar: "bg-amber-500",
        label: "ELEVATED STRESS",
        progressBg: "bg-amber-100"
      };
    } else {
      return {
        border: "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold uppercase",
        pill: "bg-emerald-600",
        text: "text-emerald-700 font-bold",
        bar: "bg-emerald-600",
        label: "NOMINAL",
        progressBg: "bg-emerald-100"
      };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xl flex flex-col justify-between h-full" id="node_network_panel">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-800 tracking-tight text-md">Structural Skeleton Dependency Mapping</h2>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-300 rounded">
            Cascading Risk Solver Active
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Aviation components are modeled as high-integrity node linkages. 
          Mathematical dependencies ensure physical stresses propagate down the fuselage assembly structure automatically, solving failure paths in real-time.
        </p>

        {/* Nodes and Links Flow */}
        <div className="space-y-4 relative">
          
          {nodes.map((node, index) => {
            const styles = getNodeStyles(node);
            
            return (
              <React.Fragment key={node.id}>
                
                {/* Visual Connector Label (shown between nodes) */}
                {index > 0 && (
                  <div className="flex flex-col items-center my-1 z-10 relative">
                    <div className="w-px h-6 bg-slate-300"></div>
                    <div className="bg-slate-50 border border-slate-200 px-3 py-0.5 rounded-full text-[10px] text-slate-600 font-mono flex items-center gap-1.5 shadow-sm">
                      <ArrowDown className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                      {index === 1 ? "Cascading stress propagation: +50% load transfer" : "Cascading stress propagation: +30% load transfer"}
                    </div>
                    <div className="w-px h-6 bg-slate-300"></div>
                  </div>
                )}

                {/* Component Node Card */}
                <div 
                  className={`border rounded-lg p-4 font-sans transition-all duration-300 relative ${styles.border}`}
                  id={`node_card_${node.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    
                    {/* Node Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                          {node.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">{node.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        <span className="text-slate-400 font-bold">Constraint:</span> {node.threshold}
                      </p>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border flex items-center gap-1.5 ${styles.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.pill}`}></span>
                        {styles.label}
                      </div>
                    </div>

                  </div>

                  {/* Calculated metrics section */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                    
                    {/* Stress representation */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="text-slate-500">Composite Stress:</span>
                        <span className={`font-semibold ${styles.text}`}>{node.stress}%</span>
                      </div>
                      {/* Bar */}
                      <div className={`w-full h-2 rounded-full ${styles.progressBg}`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${styles.bar}`} 
                          style={{ width: `${node.stress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* RUL and Live Multiplier check */}
                    <div className="flex flex-col justify-end text-[11px] font-mono text-slate-600 space-y-0.5 md:pl-4 md:border-l border-slate-200">
                      <div>
                        <span className="text-slate-400 font-bold">RUL:</span> <span className="text-slate-800 font-bold">{node.rulHours} hrs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Live Input:</span> <span className="text-blue-700 font-semibold">{node.currentTrigger}</span>
                      </div>
                    </div>

                  </div>

                  {/* Red/Amber Special Flag Detail */}
                  {node.stress > 40 && (
                    <div className="mt-3 bg-amber-50 p-2.5 border border-amber-200 rounded text-[11px] font-mono text-slate-700 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-amber-700 font-bold">Action Suggested: </span> 
                        {node.action}
                      </div>
                    </div>
                  )}

                </div>
              </React.Fragment>
            );
          })}

        </div>
      </div>

      <div className="mt-6 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping"></div>
        <div>
          <span className="text-slate-800 font-bold">Trace-Monitoring Alert: </span> 
          If Vibration Frequency exceeds <span className="text-red-600 font-bold">120Hz</span>, Node 1 will shift instantly to critical status, triggering cascades along both Wing Joint and Fuselage Nodes.
        </div>
      </div>
    </div>
  );
}
