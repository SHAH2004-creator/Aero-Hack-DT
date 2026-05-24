import React, { useState, useEffect } from "react";
import { Sliders, Activity, Flame, Gauge, AlertCircle, ToggleLeft, ToggleRight, Play, Pause } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TelemetryState, HistoricalPoint } from "../types";

interface TelemetryPanelProps {
  telemetry: TelemetryState;
  history: HistoricalPoint[];
  onChange: (key: keyof TelemetryState, val: number) => void;
  isStreaming: boolean;
  setIsStreaming: (stream: boolean) => void;
}

export default function TelemetryPanel({ telemetry, history, onChange, isStreaming, setIsStreaming }: TelemetryPanelProps) {
  const [localVib, setLocalVib] = useState(telemetry.vibration);
  const [localStrain, setLocalStrain] = useState(telemetry.strain);
  const [localTemp, setLocalTemp] = useState(telemetry.temperature);

  // Keep local variables in sync with master parent state updates
  useEffect(() => {
    setLocalVib(telemetry.vibration);
  }, [telemetry.vibration]);

  useEffect(() => {
    setLocalStrain(telemetry.strain);
  }, [telemetry.strain]);

  useEffect(() => {
    setLocalTemp(telemetry.temperature);
  }, [telemetry.temperature]);

  const handleSliderChange = (key: keyof TelemetryState, value: number, setter: (v: number) => void) => {
    setter(value);
    onChange(key, value);
  };

  const handleTextChange = (key: keyof TelemetryState, text: string, min: number, max: number, setter: (v: number) => void) => {
    const numeric = parseInt(text, 10);
    if (!isNaN(numeric)) {
      const clamped = Math.min(max, Math.max(min, numeric));
      setter(clamped);
      onChange(key, clamped);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xl flex flex-col justify-between h-full" id="telemetry_panel">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-800 tracking-tight text-md">Synthetic Flight Telemetry Feed (Simulated Input Controls)</h2>
          </div>
          
          {/* Active Live Stream Toggler */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs border transition duration-200 ${
              isStreaming 
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-bold" 
                : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
            }`}
            title="Stream simulator ticks"
            id="stream_toggle_btn"
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-emerald-600" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Stream
              </>
            )}
          </button>
        </div>

        {/* Input Sliders Layout */}
        <div className="space-y-6">
          
          {/* Slider 1: Harmonic Rotor Vibration */}
          <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-700 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-sky-600" /> HARMONIC ROTOR VIBRATION
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localVib}
                  min={10}
                  max={200}
                  onChange={(e) => handleTextChange("vibration", e.target.value, 10, 200, setLocalVib)}
                  className="w-12 text-center bg-white border border-slate-300 text-slate-800 rounded px-1.5 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  id="vibration_exact_input"
                />
                <span className="text-slate-500 font-mono text-[10px]">Hz</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono">10Hz</span>
              <input
                type="range"
                min={10}
                max={200}
                value={localVib}
                onChange={(e) => handleSliderChange("vibration", Number(e.target.value), setLocalVib)}
                className="flex-1 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                id="vibration_slider"
              />
              <span className="text-[10px] text-slate-600 font-mono font-bold">200Hz</span>
            </div>
            
            {localVib > 120 && (
              <div className="text-[10px] text-red-700 font-mono flex items-center gap-1 mt-1 bg-red-50 p-1.5 rounded border border-red-200">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" /> Bearing failure threshold exceeded (&gt;120Hz)
              </div>
            )}
          </div>

          {/* Slider 2: Aerodynamic Strain Gauge */}
          <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-700 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-emerald-600" /> AERODYNAMIC STRAIN GAUGE
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localStrain}
                  min={0}
                  max={100}
                  onChange={(e) => handleTextChange("strain", e.target.value, 0, 100, setLocalStrain)}
                  className="w-12 text-center bg-white border border-slate-300 text-slate-800 rounded px-1.5 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  id="strain_exact_input"
                />
                <span className="text-slate-500 font-mono text-[10px]">%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono">0%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={localStrain}
                onChange={(e) => handleSliderChange("strain", Number(e.target.value), setLocalStrain)}
                className="flex-1 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
                id="strain_slider"
              />
              <span className="text-[10px] text-slate-600 font-mono font-bold">100%</span>
            </div>
          </div>

          {/* Slider 3: Engine Mount Thermal Fatigue */}
          <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-700 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-600" /> ENGINE MOUNT THERMAL FATIGUE
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localTemp}
                  min={20}
                  max={150}
                  onChange={(e) => handleTextChange("temperature", e.target.value, 20, 150, setLocalTemp)}
                  className="w-12 text-center bg-white border border-slate-300 text-slate-800 rounded px-1.5 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  id="temperature_exact_input"
                />
                <span className="text-slate-500 font-mono text-[10px]">°C</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono">20°C</span>
              <input
                type="range"
                min={20}
                max={150}
                value={localTemp}
                onChange={(e) => handleSliderChange("temperature", Number(e.target.value), setLocalTemp)}
                className="flex-1 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-amber-600"
                id="temperature_slider"
              />
              <span className="text-[10px] text-slate-600 font-mono font-bold">150°C</span>
            </div>
          </div>

        </div>
      </div>

      {/* Telemetry Line Plot Section */}
      <div className="mt-8 border-t border-slate-200 pt-5">
        <h3 className="font-mono text-xs text-slate-600 font-bold flex items-center gap-2 mb-3">
          <Activity className="w-3.5 h-3.5 text-blue-600" /> REAL-TIME VIBRATION DATA STREAM
        </h3>
        
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 h-[210px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 220]} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  borderColor: "#cbd5e1", 
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#1e293b"
                }}
                labelStyle={{ color: "#64748b", fontFamily: "monospace" }}
              />
              <Line 
                type="monotone" 
                dataKey="vibration" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, stroke: "#0d9488", strokeWidth: 1 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-500 px-1">
          <span>{history[0]?.time || "00:00:00"}</span>
          <span>Baseline Vibration Variance Tracking Window</span>
          <span>{history[history.length - 1]?.time || "00:00:00"}</span>
        </div>
      </div>

    </div>
  );
}
