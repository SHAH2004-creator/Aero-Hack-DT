import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
const telemetryState = {
  vibration: 42,      // Range: 10Hz to 200Hz
  strain: 25,         // Range: 0% to 100%
  temperature: 65     // Range: 20C to 150C
};

// Generate vibration historical telemetry points
const historicalTelemetry: { time: string; vibration: number }[] = [];
const maxHistorySize = 30;

// Initialize history
for (let i = maxHistorySize - 1; i >= 0; i--) {
  const timeStr = new Date(Date.now() - i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  // Add some slight random fluctuation around baseline 42
  const randVal = Math.round(42 + (Math.random() * 8 - 4));
  historicalTelemetry.push({
    time: timeStr,
    vibration: randVal
  });
}

// Pre-populated Compliance Quality Audits with high credibility issues (resembling Boeing traveled-work scenarios)
interface AuditRecord {
  id: string;
  timestamp: string;
  componentId: string;
  inspectorEmail: string;
  category: "Traveled Work" | "Torque Compliance" | "Fuselage Shimming" | "Fatigue Analysis";
  status: "Approved" | "Rectification Required" | "Sealed" | "Pending";
  notes: string;
  shiftNumber: string;
  torqueValue: number;
  shimmingDeviation: number;
}

const auditRecords: AuditRecord[] = [
  {
    id: "AUD-9104",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    componentId: "Node-1",
    inspectorEmail: "as695853@gmail.com",
    category: "Torque Compliance",
    status: "Approved",
    notes: "Rotor Bearing Assembly mounting fasteners calibrated and secured to nominal levels. Dual inspected and sealed.",
    shiftNumber: "Shift-1",
    torqueValue: 96.2,
    shimmingDeviation: 0.02
  },
  {
    id: "AUD-737M",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    componentId: "Node-2",
    inspectorEmail: "as695853@gmail.com",
    category: "Traveled Work",
    status: "Rectification Required",
    notes: "Wing Spar Joint structural inspection identified 3 unlogged fasteners. Traveled work tracker indicates they were missed during wing assembly shift transition. Flagged for immediate laser shearography verification.",
    shiftNumber: "Shift-2",
    torqueValue: 45.0,
    shimmingDeviation: 0.15
  },
  {
    id: "AUD-787S",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    componentId: "Node-3",
    inspectorEmail: "as695853@gmail.com",
    category: "Fuselage Shimming",
    status: "Pending",
    notes: "Fuselage Mount audit initiated. Active shimming gaps under fuselage micro-measure checks to avoid micro-discrepancy fatigue. Awaiting final thermal stabilization of environment.",
    shiftNumber: "Shift-3",
    torqueValue: 82.5,
    shimmingDeviation: 0.08
  }
];

// Structural Node calculations helper
function calculateComponentNodes(tState: typeof telemetryState) {
  const { vibration, strain, temperature } = tState;

  // Node 1: Rotor Bearing Assembly (Critical/Failure if Vibration > 120Hz)
  const node1Stress = Math.min(100, Math.round(((vibration - 10) / (200 - 10)) * 100));
  const node1Failed = vibration > 120;
  const node1Status = node1Failed ? "Critical Failure" : node1Stress > 55 ? "Elevated Stress" : "Healthy";

  // Node 2: Wing Spar Joint (Directly inherits 50% of the stress from Node 1)
  // Stress is combination of current strain (slider 0-100) and inherited 50% node1 stress
  const node2Stress = Math.min(100, Math.round(strain + 0.5 * node1Stress));
  const node2Status = node2Stress > 75 ? "Critical Failure" : node2Stress > 40 ? "Elevated Stress" : "Healthy";

  // Node 3: Fuselage Mount (Inherits 30% of cumulative stress of Wing Spar Node 2)
  // Standard load is derived from temperature (20C-150C) + 30% inherited Node 2 stress
  const thermalRatio = ((temperature - 20) / (150 - 20)) * 100;
  const node3Stress = Math.min(100, Math.round(thermalRatio * 0.4 + 0.3 * node2Stress));
  const node3Status = node3Stress > 75 ? "Critical Failure" : node3Stress > 40 ? "Elevated Stress" : "Healthy";

  return [
    {
      id: "Node-1",
      name: "Rotor Bearing Assembly",
      stress: node1Stress,
      isFailed: node1Failed,
      status: node1Status,
      threshold: "Vibration > 120Hz triggers critical fault",
      currentTrigger: `${vibration}Hz (Threshold: 120Hz)`,
      rulHours: Math.max(0, Math.round(1200 - (node1Stress * 8.5))),
      action: node1Failed 
        ? "Red: Immediate Torque Verification within 3 flight cycles" 
        : node1Stress > 55 
          ? "Amber: Vibration check and spectrum analysis scheduled within 10 hrs" 
          : "Green: Schedule standard maintenance"
    },
    {
      id: "Node-2",
      name: "Wing Spar Joint",
      stress: node2Stress,
      isFailed: node2Stress > 75,
      status: node2Status,
      threshold: "Inherits 50% load from Rotor Bearing + raw strain load",
      currentTrigger: `${strain}% Strain Base + ${Math.round(0.5 * node1Stress)}% inherited stress`,
      rulHours: Math.max(0, Math.round(2500 - (node2Stress * 18.5))),
      action: node2Stress > 75 
        ? "Red: Ultrasound / Eddy Current NDT crack scan immediately" 
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
}

// API Routes

// Retrieve baseline telemetry variables, calculated nodes, and compliance audits
app.get("/api/state", (req, res) => {
  const nodes = calculateComponentNodes(telemetryState);
  res.json({
    telemetry: telemetryState,
    historicalTelemetry,
    nodes,
    audits: auditRecords
  });
});

// Update the physical telemetry variables on the server (simulates active controller interface)
app.post("/api/telemetry/update", (req, res) => {
  const { vibration, strain, temperature } = req.body;

  if (vibration !== undefined) telemetryState.vibration = Number(vibration);
  if (strain !== undefined) telemetryState.strain = Number(strain);
  if (temperature !== undefined) telemetryState.temperature = Number(temperature);

  // Generate a live streaming node with simulated noise
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const noise = (Math.random() * 6 - 3); // Fluctuation range
  const streamValue = Math.min(200, Math.max(10, Math.round(telemetryState.vibration + noise)));

  historicalTelemetry.push({
    time: nowStr,
    vibration: streamValue
  });

  if (historicalTelemetry.length > maxHistorySize) {
    historicalTelemetry.shift();
  }

  // Calculate nodes to check if we just transitioned to a Critical Failure state to auto-generate warning alerts
  const nodes = calculateComponentNodes(telemetryState);

  res.json({
    success: true,
    telemetry: telemetryState,
    historicalTelemetry,
    nodes
  });
});

// Create a new Aerospace Quality Audit report
app.post("/api/audits", (req, res) => {
  const { componentId, inspectorEmail, category, status, notes, shiftNumber, torqueValue, shimmingDeviation } = req.body;

  if (!componentId || !category || !status || !notes) {
    return res.status(400).json({ error: "Missing required compliance fields" });
  }

  const newAudit: AuditRecord = {
    id: `AUD-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    componentId,
    inspectorEmail: inspectorEmail || "as695853@gmail.com",
    category,
    status,
    notes,
    shiftNumber: shiftNumber || "Shift-1",
    torqueValue: torqueValue !== undefined ? Number(torqueValue) : 0,
    shimmingDeviation: shimmingDeviation !== undefined ? Number(shimmingDeviation) : 0
  };

  auditRecords.unshift(newAudit);
  res.status(201).json({ success: true, record: newAudit, audits: auditRecords });
});

// Clear audits database helper
app.post("/api/audits/reset", (req, res) => {
  auditRecords.length = 0;
  auditRecords.push(
    {
      id: "AUD-9104",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      componentId: "Node-1",
      inspectorEmail: "as695853@gmail.com",
      category: "Torque Compliance",
      status: "Approved",
      notes: "Rotor Bearing Assembly mounting fasteners calibrated and secured to nominal levels. Dual inspected and sealed.",
      shiftNumber: "Shift-1",
      torqueValue: 96.2,
      shimmingDeviation: 0.02
    },
    {
      id: "AUD-737M",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      componentId: "Node-2",
      inspectorEmail: "as695853@gmail.com",
      category: "Traveled Work",
      status: "Rectification Required",
      notes: "Wing Spar Joint structural inspection identified 3 unlogged fasteners. Traveled work tracker indicates they were missed during wing assembly shift transition. Flagged for immediate laser shearography verification.",
      shiftNumber: "Shift-2",
      torqueValue: 45.0,
      shimmingDeviation: 0.15
    },
    {
      id: "AUD-787S",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      componentId: "Node-3",
      inspectorEmail: "as695853@gmail.com",
      category: "Fuselage Shimming",
      status: "Pending",
      notes: "Fuselage Mount audit initiated. Active shimming gaps under fuselage micro-measure checks to avoid micro-discrepancy fatigue. Awaiting final thermal stabilization of environment.",
      shiftNumber: "Shift-3",
      torqueValue: 82.5,
      shimmingDeviation: 0.08
    }
  );
  res.json({ success: true, audits: auditRecords });
});

// Setup dynamic vite middleware bindings
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AeroShield DT] Fullstack engine running on http://localhost:${PORT}`);
  });
}

runServer();
