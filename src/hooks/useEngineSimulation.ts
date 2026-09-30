"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type { EngineMode, TelemetryPoint } from "@/sim/types";
import type { EngineMode, TelemetryPoint, WorkerUpdate } from "@/sim/types";
type HookUpdate = WorkerUpdate & { history: TelemetryPoint[] };

export interface EngineSimulation {
  telemetry: TelemetryPoint | null;
  historicalData: TelemetryPoint[];
  mode: EngineMode;
  setMode: (mode: EngineMode) => void;
  healthIndex: number;
  physicsResidual: number;
  anomalyDetected: boolean;
  rulProjection: { time: number; health: number; lower: number; upper: number }[];
  detector: WorkerUpdate["detector"] | null;
  health: WorkerUpdate["health"] | null;
  rawBytesPerSecond: number;
  transmittedBytesPerSecond: number;
  bandwidthSavedPercent: number;
}

export function useEngineSimulation(): EngineSimulation {
  const [mode, setModeState] = useState<EngineMode>("NORMAL");
  const [update, setUpdate] = useState<HookUpdate | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const historyRef = useRef<{ frames: Array<TelemetryPoint | undefined>; cursor: number; count: number }>({ frames: new Array(300), cursor: 0, count: 0 });

  useEffect(() => {
    const worker = new Worker(new URL("../sim/worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerUpdate>) => {
      const ring = historyRef.current;
      ring.frames[ring.cursor] = event.data.telemetry;
      ring.cursor = (ring.cursor + 1) % ring.frames.length;
      ring.count = Math.min(ring.count + 1, ring.frames.length);
      const start = ring.count === ring.frames.length ? ring.cursor : 0;
      const history = Array.from({ length: ring.count }, (_, index) => ring.frames[(start + index) % ring.frames.length]!).filter(Boolean);
      setUpdate({ ...event.data, history });
    };
    return () => { worker.terminate(); workerRef.current = null; };
  }, []);

  const setMode = useCallback((newMode: EngineMode) => {
    setModeState(newMode);
    workerRef.current?.postMessage({ type: "mode", mode: newMode });
  }, []);

  const telemetry = update?.telemetry ?? null;
  const historicalData = update?.history ?? [];
  const rulProjection = update?.health.rulProjection ?? [];

  return {
    telemetry,
    historicalData,
    mode,
    setMode,
    healthIndex: update?.health.healthIndex ?? 100,
    physicsResidual: update?.detector.residual ?? 0,
    anomalyDetected: update?.detector.anomalyDetected ?? false,
    rulProjection,
    detector: update?.detector ?? null,
    health: update?.health ?? null,
    rawBytesPerSecond: update?.rawBytesPerSecond ?? 0,
    transmittedBytesPerSecond: update?.transmittedBytesPerSecond ?? 0,
    bandwidthSavedPercent: update?.bandwidthSavedPercent ?? 0,
  };
}
