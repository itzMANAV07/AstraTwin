import { expectedValues } from "./physics";
import { createRandom } from "./random";
import type { EngineMode, TelemetryPoint } from "./types";

// Prototype assumptions: 10 Hz sample rate, first-order 12 second thermal lag,
// seeded normal sensor noise, and synthetic scenario magnitudes.
const DT = 0.1;
const CHANNEL_NOISE = { rpm: 42, cht: 2.4, egt: 5.5, fuelFlow: 0.45, oilPressure: 1.6 };

export class EngineSimulator {
  private readonly rng = createRandom(26054);
  private seconds = 0;
  private scenarioStart = 0;
  private lastMode: EngineMode = "NORMAL";
  private values = { rpm: 4200, cht: 175, egt: 680, fuelFlow: 21, oilPressure: 70 };
  tick(mode: EngineMode): TelemetryPoint {
    this.seconds += DT;
    if (mode !== this.lastMode) { this.lastMode = mode; this.scenarioStart = this.seconds; }
    const scenarioSeconds = this.seconds - this.scenarioStart;
    const high = mode === "HIGH_ALTITUDE";
    const throttle = high ? (scenarioSeconds < 8 ? 0.72 + scenarioSeconds / 8 * 0.12 : 0.84) : mode === "ANOMALY" ? 0.72 : 0.68;
    const altitudeFt = high ? Math.min(25000, scenarioSeconds * 330) : 1200;
    const ambientTemp = 24 - altitudeFt / 1000 * 1.8;
    const target = expectedValues({ rpm: 2400 + throttle * 2300, throttle, altitudeFt, ambientTemp });
    const lerp = (current: number, next: number) => current + (next - current) * (1 - Math.exp(-DT / (next === target.cht || next === target.egt ? 12 : 2)));
    this.values.rpm = lerp(this.values.rpm, target.rpm);
    this.values.cht = lerp(this.values.cht, target.cht);
    this.values.egt = lerp(this.values.egt, target.egt);
    this.values.fuelFlow = lerp(this.values.fuelFlow, target.fuelFlow);
    this.values.oilPressure = lerp(this.values.oilPressure, target.oilPressure);
    const drift = mode === "SENSOR_DRIFT" ? Math.min(28, Math.max(0, scenarioSeconds - 2) * 1.4) : 0;
    return {
      timestamp: Date.now(), rpm: Math.round(this.values.rpm + this.rng.normal() * CHANNEL_NOISE.rpm),
      cht: Number((this.values.cht + drift + this.rng.normal() * CHANNEL_NOISE.cht).toFixed(1)),
      egt: Math.round(this.values.egt + (mode === "ANOMALY" ? 64 : 0) + this.rng.normal() * CHANNEL_NOISE.egt),
      fuelFlow: Number((this.values.fuelFlow + (mode === "ANOMALY" ? 5.8 : 0) + this.rng.normal() * CHANNEL_NOISE.fuelFlow).toFixed(1)),
      oilPressure: Number((this.values.oilPressure - (mode === "OIL_PRESSURE_LOSS" ? Math.min(35, Math.max(0, scenarioSeconds - 1) * 2.8) : 0) + this.rng.normal() * CHANNEL_NOISE.oilPressure).toFixed(1)),
      altitudeFt: Math.round(altitudeFt), ambientTemp: Number(ambientTemp.toFixed(1)), throttle,
      physicsResidual: 0, healthIndex: 100, anomalyDetected: false,
    };
  }
}
