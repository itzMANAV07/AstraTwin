import { EngineSimulator } from "./engine";
import { IsolationForestDetector } from "./detector";
import { HealthEstimator } from "./health";
import { residuals } from "./physics";
import { encodeHealthPacket, RAW_FRAME_BYTES } from "./packet";
import type { EngineMode, WorkerControl, WorkerUpdate } from "./types";

const engine = new EngineSimulator();
const detector = new IsolationForestDetector();
const healthEstimator = new HealthEstimator();
let mode: EngineMode = "NORMAL";
let rawBytes = 0;
let transmittedBytes = 0;
let lastCounterTime = performance.now();
let measuredRawBytesPerSecond = 0;
let measuredTransmittedBytesPerSecond = 0;

setInterval(() => {
  const telemetry = engine.tick(mode);
  rawBytes += RAW_FRAME_BYTES;
  const vector = residuals(telemetry, { rpm: telemetry.rpm, throttle: telemetry.throttle, altitudeFt: telemetry.altitudeFt, ambientTemp: telemetry.ambientTemp });
  const detectorResult = detector.evaluate(vector);
  const health = healthEstimator.update(detectorResult);
  telemetry.physicsResidual = detectorResult.residual;
  telemetry.healthIndex = health.healthIndex;
  telemetry.anomalyDetected = detectorResult.anomalyDetected;
  const now = performance.now();
  let healthPacket: Uint8Array | null = null;
  if (now - lastCounterTime >= 1000) {
    const packet = encodeHealthPacket(telemetry, detectorResult, health);
    healthPacket = packet;
    transmittedBytes += packet.byteLength;
    const elapsedSeconds = (now - lastCounterTime) / 1000;
    measuredRawBytesPerSecond = rawBytes / elapsedSeconds;
    measuredTransmittedBytesPerSecond = transmittedBytes / elapsedSeconds;
    rawBytes = 0; transmittedBytes = 0; lastCounterTime = now;
  }
  const update: WorkerUpdate = {
    type: "update", mode, telemetry, detector: detectorResult, health,
    rawBytesPerSecond: measuredRawBytesPerSecond,
    transmittedBytesPerSecond: measuredTransmittedBytesPerSecond,
    bandwidthSavedPercent: measuredRawBytesPerSecond ? (1 - measuredTransmittedBytesPerSecond / measuredRawBytesPerSecond) * 100 : 0,
    healthPacket,
  };
  self.postMessage(update);
}, 100);

self.onmessage = (event: MessageEvent<WorkerControl>) => {
  if (event.data.type === "mode") mode = event.data.mode;
};
