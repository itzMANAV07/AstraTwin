"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type EngineMode = "NORMAL" | "HIGH_ALTITUDE" | "ANOMALY";

export interface TelemetryPoint {
  timestamp: number;
  rpm: number;
  cht: number;
  egt: number;
  fuelFlow: number;
  oilPressure: number;
  physicsResidual: number;
  healthIndex: number;
  anomalyDetected: boolean;
}

interface ModeTargets {
  rpm: number;
  rpmNoise: number;
  cht: number;
  chtNoise: number;
  egt: number;
  egtNoise: number;
  fuelFlow: number;
  fuelFlowNoise: number;
  oilPressure: number;
  oilPressureNoise: number;
  physicsResidual: number;
  physicsResidualNoise: number;
  healthIndex: number;
}

const MODE_TARGETS: Record<EngineMode, ModeTargets> = {
  NORMAL: {
    rpm: 4200,
    rpmNoise: 50,
    cht: 180,
    chtNoise: 2,
    egt: 690,
    egtNoise: 5,
    fuelFlow: 21.2,
    fuelFlowNoise: 0.5,
    oilPressure: 72,
    oilPressureNoise: 1,
    physicsResidual: 0.0,
    physicsResidualNoise: 0.5,
    healthIndex: 98,
  },
  HIGH_ALTITUDE: {
    rpm: 4500,
    rpmNoise: 60,
    cht: 195,
    chtNoise: 3,
    egt: 720,
    egtNoise: 8,
    fuelFlow: 23.0,
    fuelFlowNoise: 0.6,
    oilPressure: 70,
    oilPressureNoise: 1.5,
    physicsResidual: 0.0,
    physicsResidualNoise: 0.8,
    healthIndex: 96,
  },
  ANOMALY: {
    rpm: 4200,
    rpmNoise: 50,
    cht: 180,
    chtNoise: 2,
    egt: 690,
    egtNoise: 5,
    fuelFlow: 28.5,
    fuelFlowNoise: 1.2,
    oilPressure: 58,
    oilPressureNoise: 3,
    physicsResidual: 18.5,
    physicsResidualNoise: 1.5,
    healthIndex: 42,
  },
};

const BUFFER_SIZE = 300;
const TICK_MS = 100;
const LERP_FACTOR = 0.04;

function gaussianNoise(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export interface EngineSimulation {
  telemetry: TelemetryPoint | null;
  historicalData: TelemetryPoint[];
  mode: EngineMode;
  setMode: (mode: EngineMode) => void;
  healthIndex: number;
  physicsResidual: number;
  anomalyDetected: boolean;
  rulProjection: { time: number; health: number; lower: number; upper: number }[];
}

export function useEngineSimulation(): EngineSimulation {
  const [mode, setModeState] = useState<EngineMode>("NORMAL");
  const [historicalData, setHistoricalData] = useState<TelemetryPoint[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>(null);

  const currentValues = useRef({
    rpm: 4200,
    cht: 180,
    egt: 690,
    fuelFlow: 21.2,
    oilPressure: 72,
    physicsResidual: 0.0,
    healthIndex: 98,
  });

  const modeRef = useRef<EngineMode>("NORMAL");
  const bufferRef = useRef<TelemetryPoint[]>([]);

  const setMode = useCallback((newMode: EngineMode) => {
    modeRef.current = newMode;
    setModeState(newMode);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const targets = MODE_TARGETS[modeRef.current];
      const cv = currentValues.current;

      cv.rpm = lerp(cv.rpm, targets.rpm, LERP_FACTOR);
      cv.cht = lerp(cv.cht, targets.cht, LERP_FACTOR);
      cv.egt = lerp(cv.egt, targets.egt, LERP_FACTOR);
      cv.fuelFlow = lerp(cv.fuelFlow, targets.fuelFlow, LERP_FACTOR);
      cv.oilPressure = lerp(cv.oilPressure, targets.oilPressure, LERP_FACTOR);
      cv.physicsResidual = lerp(cv.physicsResidual, targets.physicsResidual, LERP_FACTOR);
      cv.healthIndex = lerp(cv.healthIndex, targets.healthIndex, LERP_FACTOR * 0.5);

      const point: TelemetryPoint = {
        timestamp: Date.now(),
        rpm: Math.round(cv.rpm + gaussianNoise() * targets.rpmNoise),
        cht: parseFloat((cv.cht + gaussianNoise() * targets.chtNoise).toFixed(1)),
        egt: Math.round(cv.egt + gaussianNoise() * targets.egtNoise),
        fuelFlow: parseFloat((cv.fuelFlow + gaussianNoise() * targets.fuelFlowNoise).toFixed(1)),
        oilPressure: parseFloat(
          (cv.oilPressure + gaussianNoise() * targets.oilPressureNoise).toFixed(1)
        ),
        physicsResidual: parseFloat(
          Math.max(0, cv.physicsResidual + gaussianNoise() * targets.physicsResidualNoise).toFixed(1)
        ),
        healthIndex: parseFloat(
          Math.min(100, Math.max(0, cv.healthIndex + gaussianNoise() * 0.3)).toFixed(1)
        ),
        anomalyDetected: cv.physicsResidual > 5,
      };

      bufferRef.current = [...bufferRef.current, point].slice(-BUFFER_SIZE);

      setTelemetry(point);
      setHistoricalData([...bufferRef.current]);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  const rulProjection = generateRULProjection(telemetry?.healthIndex ?? 98, mode);

  return {
    telemetry,
    historicalData,
    mode,
    setMode,
    healthIndex: telemetry?.healthIndex ?? 98,
    physicsResidual: telemetry?.physicsResidual ?? 0,
    anomalyDetected: telemetry?.anomalyDetected ?? false,
    rulProjection,
  };
}

function generateRULProjection(
  currentHealth: number,
  mode: EngineMode
): { time: number; health: number; lower: number; upper: number }[] {
  const points: { time: number; health: number; lower: number; upper: number }[] = [];
  const steps = 50;

  if (mode === "ANOMALY") {
    let h = currentHealth;
    for (let i = 0; i <= steps; i++) {
      const decay = 1.2 + (i / steps) * 0.5;
      h = Math.max(0, h - decay);
      const spread = 3 + i * 0.4;
      points.push({
        time: i,
        health: parseFloat(h.toFixed(1)),
        lower: parseFloat(Math.max(0, h - spread).toFixed(1)),
        upper: parseFloat(Math.min(100, h + spread).toFixed(1)),
      });
    }
  } else {
    for (let i = 0; i <= steps; i++) {
      const h = currentHealth - i * 0.02;
      const spread = 1 + i * 0.1;
      points.push({
        time: i,
        health: parseFloat(h.toFixed(1)),
        lower: parseFloat(Math.max(0, h - spread).toFixed(1)),
        upper: parseFloat(Math.min(100, h + spread).toFixed(1)),
      });
    }
  }

  return points;
}
