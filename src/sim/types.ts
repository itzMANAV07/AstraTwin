export type EngineMode = "NORMAL" | "HIGH_ALTITUDE" | "ANOMALY" | "OIL_PRESSURE_LOSS" | "SENSOR_DRIFT";
export type FaultType = "NONE" | "INJECTOR" | "LUBRICATION" | "SENSOR_SUSPECT";
export type ComponentId = "cylinder_1" | "cylinder_2" | "cylinder_3" | "cylinder_4" | "lubrication" | "cooling" | null;

export interface TelemetryPoint {
  timestamp: number;
  rpm: number;
  cht: number;
  egt: number;
  fuelFlow: number;
  oilPressure: number;
  altitudeFt: number;
  ambientTemp: number;
  throttle: number;
  physicsResidual: number;
  healthIndex: number;
  anomalyDetected: boolean;
}

export interface ResidualVector {
  rpm: number;
  cht: number;
  egt: number;
  fuelFlow: number;
  oilPressure: number;
}

export interface DetectorResult {
  anomalyDetected: boolean;
  sensorStatus: "NOMINAL" | "SENSOR CHECK";
  faultType: FaultType;
  componentId: ComponentId;
  score: number;
  residual: number;
}

export interface HealthResult {
  healthIndex: number;
  rulHours: number | null;
  rulProjection: { time: number; health: number; lower: number; upper: number }[];
  missionReliability: number;
  recommendation: "CONTINUE" | "CAUTION" | "RETURN";
  trendStatus: "ESTIMATED" | "INSUFFICIENT TREND";
}

export interface WorkerUpdate {
  type: "update";
  mode: EngineMode;
  telemetry: TelemetryPoint;
  detector: DetectorResult;
  health: HealthResult;
  rawBytesPerSecond: number;
  transmittedBytesPerSecond: number;
  bandwidthSavedPercent: number;
  healthPacket: Uint8Array | null;
}

export interface WorkerControl { type: "mode"; mode: EngineMode }
