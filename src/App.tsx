import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import TelemetryPanel from "./components/TelemetryPanel";
import NodeNetwork from "./components/NodeNetwork";
import RULMatrix from "./components/RULMatrix";
import CaseStudy from "./components/CaseStudy";
import AuditSection from "./components/AuditSection";
import { TelemetryState, HistoricalPoint, ComponentNode, AuditRecord } from "./types";
import { isFirebaseActive, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    vibration: 42,
    strain: 25,
    temperature: 65,
  });
  const [history, setHistory] = useState<HistoricalPoint[]>([]);
  const [nodes, setNodes] = useState<ComponentNode[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  
  // Auth state management
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingApp, setLoadingApp] = useState(true);

  // Bind to authentications trigger
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else {
          setUser(null);
        }
        setLoadingAuth(false);
      });
      return unsubscribe;
    } else {
      // In simulation mode, pre-authorize inspector to keep user's profile active automatically
      setUser({
        displayName: "Quality Engineer (FAA Accredited)",
        email: "as695853@gmail.com",
        photoURL: ""
      });
      setLoadingAuth(false);
    }
  }, []);

  // Fetch initial telemetry and states on mount
  useEffect(() => {
    async function loadState() {
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data.telemetry);
          setHistory(data.historicalTelemetry);
          setNodes(data.nodes);
          setAudits(data.audits);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        setIsConnected(false);
        console.debug("AeroShield Offline: Initializing digital twin in secure fallback sandbox mode.");
      } finally {
        setLoadingApp(false);
      }
    }
    loadState();
  }, []);

  // Live active system interval dispatcher with auto-recovery and overlap guarding
  useEffect(() => {
    if (!isStreaming) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let isFetching = false;

    async function tick() {
      if (!isMounted || !isStreaming) return;
      if (isFetching) {
        timeoutId = setTimeout(tick, 1000);
        return;
      }

      isFetching = true;
      const controller = new AbortController();
      const timeoutIdWatchdog = setTimeout(() => controller.abort(), 2000);

      try {
        // Ping telemetry update with empty payload to advance server history time slice
        const res = await fetch("/api/telemetry/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          signal: controller.signal,
        });

        clearTimeout(timeoutIdWatchdog);

        if (res.ok && isMounted) {
          const data = await res.json();
          setTelemetry(data.telemetry);
          setHistory(data.historicalTelemetry);
          setNodes(data.nodes);
          setIsConnected(true);
        } else {
          if (isMounted) setIsConnected(false);
        }
      } catch (err: any) {
        clearTimeout(timeoutIdWatchdog);
        if (isMounted) {
          setIsConnected(false);
          // High-fidelity local simulation fallback to prevent interruptions on offline state
          setTelemetry((prev) => {
            const noise = (Math.random() * 6 - 3);
            const nextVib = Math.min(200, Math.max(10, Math.round(prev.vibration + noise)));
            
            setHistory((prevHistory) => {
              const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const nextHistory = [...prevHistory, { time: nowStr, vibration: nextVib }];
              if (nextHistory.length > 30) nextHistory.shift();
              return nextHistory;
            });

            // Also calculate stress nodes completely client-side
            const node1Stress = Math.min(100, Math.round(((nextVib - 10) / (200 - 10)) * 100));
            const node1Failed = nextVib > 120;
            const node1Status = node1Failed ? "Critical Failure" : node1Stress > 55 ? "Elevated Stress" : "Healthy";

            const node2Stress = Math.min(100, Math.round(prev.strain + 0.5 * node1Stress));
            const node2Status = node2Stress > 75 ? "Critical Failure" : node2Stress > 40 ? "Elevated Stress" : "Healthy";

            const thermalRatio = ((prev.temperature - 20) / (150 - 20)) * 100;
            const node3Stress = Math.min(100, Math.round(thermalRatio * 0.4 + 0.3 * node2Stress));
            const node3Status = node3Stress > 75 ? "Critical Failure" : node3Stress > 40 ? "Elevated Stress" : "Healthy";

            const simulatedNodes: ComponentNode[] = [
              {
                id: "Node-1",
                name: "Rotor Bearing Assembly",
                stress: node1Stress,
                isFailed: node1Failed,
                status: node1Status,
                threshold: "Vibration > 120Hz triggers critical fault",
                currentTrigger: `${nextVib}Hz (Threshold: 120Hz)`,
                rulHours: Math.max(0, Math.round(1200 - (node1Stress * 8.5))),
                action: node1Failed 
                  ? "Red: Immediate Torque Verification within 3 flight cycles" 
                  : node1Stress > 55 
                    ? "Amber: Vibration check scheduled within 10 hrs" 
                    : "Green: Schedule standard maintenance"
              },
              {
                id: "Node-2",
                name: "Wing Spar Joint",
                stress: node2Stress,
                isFailed: node2Stress > 75,
                status: node2Status,
                threshold: "Inherits 50% load from Rotor Bearing + raw strain load",
                currentTrigger: `${prev.strain}% Strain Base + ${Math.round(0.5 * node1Stress)}% inherited stress`,
                rulHours: Math.max(0, Math.round(2500 - (node2Stress * 18.5))),
                action: node2Stress > 75 
                  ? "Red: Ultrasound crack scan immediately" 
                  : node2Stress > 40 
                    ? "Amber: Structural frame fastener tension audit next flight cycle" 
                    : "Green: Wing structures stable"
              },
              {
                id: "Node-3",
                name: "Fuselage Mount",
                stress: node3Stress,
                isFailed: node3Stress > 75,
                status: node3Status,
                threshold: "Inherits 30% of Node-2 Wing Joint load + raw thermo-workload",
                currentTrigger: `${Math.round(thermalRatio)}% Thermal load + ${Math.round(0.3 * node2Stress)}% inherited stress`,
                rulHours: Math.max(0, Math.round(4000 - (node3Stress * 26.0))),
                action: node3Stress > 75 
                  ? "Red: Complete fuselage shimming audit & fastener replacement required" 
                  : node3Stress > 40 
                    ? "Amber: Thermographic shim inspection scheduled in 24 hours" 
                    : "Green: Continuous fuselage shim tracking active"
              }
            ];

            setNodes(simulatedNodes);

            return { ...prev, vibration: nextVib };
          });
        }
      } finally {
        isFetching = false;
        if (isMounted && isStreaming) {
          timeoutId = setTimeout(tick, 1000);
        }
      }
    }

    timeoutId = setTimeout(tick, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isStreaming]);

  // Handle user inputs changing metrics
  const hTelemetryChange = async (key: keyof TelemetryState, val: number) => {
    // Symmetrically update local state first for snap-smooth UI dragging
    const nextTelemetry = { ...telemetry, [key]: val };
    setTelemetry(nextTelemetry);

    try {
      const res = await fetch("/api/telemetry/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: val }),
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.historicalTelemetry);
        setNodes(data.nodes);
      }
    } catch (err) {
      console.error("Fail updating variable: ", key, val, err);
    }
  };

  // Archive a customized QA audit log document block
  const hAddAudit = async (newAudit: Omit<AuditRecord, "id" | "timestamp">) => {
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAudit),
      });
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits);
      }
    } catch (err) {
      console.error("Archiving QA Audit Failed:", err);
    }
  };

  // Rebuild defaults inside our simulated session ledger
  const hResetAudits = async () => {
    try {
      const res = await fetch("/api/audits/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits);
      }
    } catch (err) {
      console.error("QA Re-Sealing Failed:", err);
    }
  };

  // Solve the collective system status dynamically
  const getSystemIntegrity = () => {
    if (nodes.some((n) => n.isFailed)) return "CRITICAL";
    if (nodes.some((n) => n.stress > 55)) return "DEGRADED";
    return "STABLE";
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen bg-[#0c1017] flex flex-col items-center justify-center text-white font-mono gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm">INITIALIZING AEROSPACE DIGITAL TWIN SIMULATION CORE...</p>
      </div>
    );
  }

  const currentIntegrity = getSystemIntegrity();

  return (
    <div className="bg-[#0F172A] min-h-screen text-slate-100 font-sans flex flex-col justify-between" id="aeroshield_app">
      
      {/* 1. Global Diagnostic Nav */}
      <Header 
        systemIntegrity={currentIntegrity} 
        user={user} 
        setUser={setUser} 
        loadingAuth={loadingAuth} 
        isConnected={isConnected}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 flex-1 w-full">
        
        {/* 2. Responsive Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Column A (40%): Telemetry Panel */}
          <section className="lg:col-span-5 flex flex-col" aria-label="Synthesis Controls">
            <TelemetryPanel 
              telemetry={telemetry}
              history={history}
              onChange={hTelemetryChange}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
            />
          </section>

          {/* Column B (60%): Cascading Failure Graph Node Network */}
          <section className="lg:col-span-7 flex flex-col" aria-label="Skeleton Physics Solver">
            <NodeNetwork nodes={nodes} />
          </section>

        </div>

        {/* 3. Lower Full-Width Analysis Tier */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6" aria-label="Detailed Compliance Evaluation">
          
          {/* Section A (RUL Analytics Table) */}
          <div className="xl:col-span-8 flex flex-col">
            <RULMatrix nodes={nodes} />
          </div>

          {/* Section B (Industry Case Study Warning Ledger) */}
          <div className="xl:col-span-4 flex flex-col">
            <CaseStudy />
          </div>

        </section>

        {/* 4. Quality Audit submission block */}
        <section aria-label="Aerospace Certifications Ledger">
          <AuditSection 
            audits={audits}
            onAddAudit={hAddAudit}
            onResetAudits={hResetAudits}
            currentUserEmail={user?.email || "as695853@gmail.com"}
          />
        </section>

      </main>

      {/* Footer detail */}
      <footer className="border-t border-slate-800 bg-[#0B1220] py-4 px-6 text-center text-[10px] font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> AEROSHIELD DT IS PROTOTYPED FOR INDUSTRIAL EVALUATION Compliance QA Ledger
          </span>
          <span>© 2026 AeroShield DT. DEEP ANALYTICAL RISK REDUCTION FOR THE FLIGHT LINE.</span>
        </div>
      </footer>

    </div>
  );
}
