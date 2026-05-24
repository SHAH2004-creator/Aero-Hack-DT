export interface TelemetryState {
  vibration: number;
  strain: number;
  temperature: number;
}

export interface HistoricalPoint {
  time: string;
  vibration: number;
}

export interface ComponentNode {
  id: string;
  name: string;
  stress: number;
  isFailed: boolean;
  status: string;
  threshold: string;
  currentTrigger: string;
  rulHours: number;
  action: string;
}

export interface AuditRecord {
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
