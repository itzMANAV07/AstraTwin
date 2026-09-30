import { useEffect, useMemo, useState } from "react";
import { useEngineSimulation } from "@/hooks/useEngineSimulation";
import { Header } from "@/components/header";
import { DirectorPanel } from "@/components/director-panel";
import { TelemetryChart } from "@/components/telemetry-chart";
import { SpatialTwin } from "@/components/spatial-twin";
import { RULChart } from "@/components/rul-chart";
import { MaintenanceAdvisory } from "@/components/maintenance-advisory";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import PrivacyPolicy from "@/app/privacy/page";
import TermsAndConditions from "@/app/terms/page";

import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
} as const;

function DashboardPage() {
  const {
    telemetry,
    historicalData,
    mode,
    setMode,
    healthIndex,
    physicsResidual,
    anomalyDetected,
    rulProjection,
    detector,
    health,
    bandwidthSavedPercent,
    rawBytesPerSecond,
    transmittedBytesPerSecond,
  } = useEngineSimulation();
  const [showFps, setShowFps] = useState(() => import.meta.env.DEV && new URLSearchParams(window.location.search).get("fps") === "1");
  const [fps, setFps] = useState(0);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key.toLowerCase() === "f" && import.meta.env.DEV) setShowFps((value) => !value); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!showFps || !import.meta.env.DEV) return;
    let frames = 0; let start = performance.now(); let frameId = 0;
    const measure = (now: number) => {
      frames++;
      if (now - start >= 1000) { setFps(Math.round(frames * 1000 / (now - start))); frames = 0; start = now; }
      frameId = requestAnimationFrame(measure);
    };
    frameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frameId);
  }, [showFps]);

  const chartData = useMemo(() => {
    const chartFrames = historicalData.length > 150 ? historicalData.filter((_, index) => index % 2 === 0 || index === historicalData.length - 1) : historicalData;
    return {
      rpm: chartFrames.map((d) => ({ timestamp: d.timestamp, value: d.rpm })),
      cht: chartFrames.map((d) => ({ timestamp: d.timestamp, value: d.cht })),
      egt: chartFrames.map((d) => ({ timestamp: d.timestamp, value: d.egt })),
      fuelFlow: chartFrames.map((d) => ({ timestamp: d.timestamp, value: d.fuelFlow })),
      oilPressure: chartFrames.map((d) => ({ timestamp: d.timestamp, value: d.oilPressure })),
    };
  }, [historicalData]);

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-14 flex flex-col relative">
      {/* Global CSS background grid for a more virtual feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.3)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <Header mode={mode} healthIndex={healthIndex} physicsResidual={physicsResidual} bandwidthSavedPercent={bandwidthSavedPercent} rawBytesPerSecond={rawBytesPerSecond} transmittedBytesPerSecond={transmittedBytesPerSecond} />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 p-6 flex flex-col gap-6 w-full max-w-screen-2xl mx-auto overflow-hidden relative z-10"
      >
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Telemetry Charts (Left - 60%) */}
          <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="transition-transform hover:scale-[1.02] hover:z-10 duration-300">
                <TelemetryChart
                  data={chartData.rpm}
                  label="Engine RPM"
                  color="#10b981"
                  unit="rpm"
                  currentValue={telemetry?.rpm ?? 0}
                />
              </div>
              <div className="transition-transform hover:scale-[1.02] hover:z-10 duration-300">
                <TelemetryChart
                  data={chartData.cht}
                  label="Cylinder Head Temp"
                  color="#f59e0b"
                  unit="°C"
                  currentValue={telemetry?.cht ?? 0}
                  warningThreshold={210}
                />
              </div>
              <div className="transition-transform hover:scale-[1.02] hover:z-10 duration-300">
                <TelemetryChart
                  data={chartData.egt}
                  label="Exhaust Gas Temp"
                  color="#f43f5e"
                  unit="°C"
                  currentValue={telemetry?.egt ?? 0}
                  warningThreshold={750}
                />
              </div>
              <div className="transition-transform hover:scale-[1.02] hover:z-10 duration-300">
                <TelemetryChart
                  data={chartData.oilPressure}
                  label="Oil Pressure"
                  color="#06b6d4"
                  unit="psi"
                  currentValue={telemetry?.oilPressure ?? 0}
                  warningThreshold={50}
                />
              </div>
            </div>
            
            <div className="transition-transform hover:scale-[1.01] hover:z-10 duration-300">
              <TelemetryChart
                data={chartData.fuelFlow}
                label="Fuel Flow (Injector)"
                color="#14b8a6"
                unit="L/h"
                currentValue={telemetry?.fuelFlow ?? 0}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-[10px] uppercase text-zinc-400">
              <div><span className="block text-zinc-500">THRESHOLD ALARM</span><span className={telemetry && (telemetry.cht > 210 || telemetry.egt > 750 || telemetry.oilPressure < 50) ? "text-rose-400" : "text-emerald-400"}>{telemetry && (telemetry.cht > 210 || telemetry.egt > 750 || telemetry.oilPressure < 50) ? "ALARM" : "NO ALARM"}</span></div>
              <div><span className="block text-zinc-500">ASTRATWIN</span><span className={detector?.sensorStatus === "SENSOR CHECK" ? "text-amber-400" : anomalyDetected ? "text-rose-400" : "text-emerald-400"}>{detector?.sensorStatus === "SENSOR CHECK" ? "SENSOR CHECK" : anomalyDetected ? "ANOMALY" : "NOMINAL"}</span></div>
            </div>
          </motion.div>

          {/* 3D Engine Model (Right - 40%) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col">
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-sm p-4 flex flex-col h-full min-h-[300px] shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors hover:border-zinc-700 duration-300">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-sm text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                  Spatial Twin
                </span>
                <span className={`text-xs font-mono px-2 py-1 rounded-none shadow-sm ${detector?.sensorStatus === 'SENSOR CHECK' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : anomalyDetected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
                  {detector?.sensorStatus === 'SENSOR CHECK' ? 'SENSOR CHECK' : `RESIDUAL: ${physicsResidual.toFixed(1)} σ`}
                </span>
              </div>
              <SpatialTwin anomalyLocation={detector?.componentId ?? null} sensorSuspect={detector?.sensorStatus === 'SENSOR CHECK'} />
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RUL Forecast Panel */}
          <motion.div variants={itemVariants} className="transition-transform hover:-translate-y-1 duration-300">
            <div className="h-full shadow-[0_0_15px_rgba(0,0,0,0.3)]">
              <RULChart data={rulProjection} anomalyDetected={anomalyDetected} missionReliability={health?.missionReliability ?? 1} recommendation={health?.recommendation ?? 'CONTINUE'} sensorStatus={detector?.sensorStatus ?? 'NOMINAL'} rulHours={health?.rulHours ?? null} trendStatus={health?.trendStatus ?? 'INSUFFICIENT TREND'} />
            </div>
          </motion.div>

          {/* Maintenance Advisory Panel */}
          <motion.div variants={itemVariants} className="transition-transform hover:-translate-y-1 duration-300">
            <div className="h-full shadow-[0_0_15px_rgba(0,0,0,0.3)]">
              <MaintenanceAdvisory anomalyDetected={anomalyDetected} detector={detector} health={health} telemetry={telemetry} />
            </div>
          </motion.div>
        </div>
        <footer className="flex justify-end gap-4 border-t border-zinc-800 pt-2 text-[10px] font-mono uppercase text-zinc-600">
          <Link className="hover:text-zinc-300" to="/privacy">Privacy Policy</Link>
          <Link className="hover:text-zinc-300" to="/terms">Terms and Conditions</Link>
        </footer>
      </motion.main>

      <DirectorPanel mode={mode} onModeChange={setMode} />
      {showFps && import.meta.env.DEV && <div className="fixed bottom-16 right-4 z-50 border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[10px] text-cyan-400">FPS {fps}</div>}
    </div>
  );
}

export default function App() {
  return <Routes><Route path="/" element={<DashboardPage />} /><Route path="/privacy" element={<PrivacyPolicy />} /><Route path="/terms" element={<TermsAndConditions />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
