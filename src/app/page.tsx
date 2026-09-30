"use client";

import { useEngineSimulation } from "@/hooks/useEngineSimulation";
import { Header } from "@/components/header";
import { DirectorPanel } from "@/components/director-panel";
import { TelemetryChart } from "@/components/telemetry-chart";
import { SpatialTwin } from "@/components/spatial-twin";
import { RULChart } from "@/components/rul-chart";
import { MaintenanceAdvisory } from "@/components/maintenance-advisory";

import { motion } from 'motion/react';

export default function DashboardPage() {
  const {
    telemetry,
    historicalData,
    mode,
    setMode,
    healthIndex,
    physicsResidual,
    anomalyDetected,
    rulProjection,
  } = useEngineSimulation();

  const chartData = {
    rpm: historicalData.map((d) => ({ timestamp: d.timestamp, value: d.rpm })),
    cht: historicalData.map((d) => ({ timestamp: d.timestamp, value: d.cht })),
    egt: historicalData.map((d) => ({ timestamp: d.timestamp, value: d.egt })),
    fuelFlow: historicalData.map((d) => ({ timestamp: d.timestamp, value: d.fuelFlow })),
    oilPressure: historicalData.map((d) => ({ timestamp: d.timestamp, value: d.oilPressure })),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-14 flex flex-col relative">
      {/* Global CSS background grid for a more virtual feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.3)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <Header mode={mode} healthIndex={healthIndex} physicsResidual={physicsResidual} />

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
                color="#8b5cf6"
                unit="L/h"
                currentValue={telemetry?.fuelFlow ?? 0}
              />
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
                <span className={`text-xs font-mono px-2 py-1 rounded-none shadow-sm ${anomalyDetected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
                  RESIDUAL: {physicsResidual.toFixed(1)}%
                </span>
              </div>
              <SpatialTwin anomalyLocation={anomalyDetected ? 'cylinder_2' : null} />
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RUL Forecast Panel */}
          <motion.div variants={itemVariants} className="transition-transform hover:-translate-y-1 duration-300">
            <div className="h-full shadow-[0_0_15px_rgba(0,0,0,0.3)]">
              <RULChart data={rulProjection} anomalyDetected={anomalyDetected} />
            </div>
          </motion.div>

          {/* Maintenance Advisory Panel */}
          <motion.div variants={itemVariants} className="transition-transform hover:-translate-y-1 duration-300">
            <div className="h-full shadow-[0_0_15px_rgba(0,0,0,0.3)]">
              <MaintenanceAdvisory anomalyDetected={anomalyDetected} mode={mode} />
            </div>
          </motion.div>
        </div>
      </motion.main>

      <DirectorPanel mode={mode} onModeChange={setMode} />
    </div>
  );
}
