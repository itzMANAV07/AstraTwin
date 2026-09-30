import type { DetectorResult, HealthResult } from "./types";

// Prototype assumptions: health floor for RUL is 30, mission horizon defaults to 6 hours,
// and confidence widens with projection distance to express model uncertainty.
export class HealthEstimator {
  private health = 100;
  private samples: { seconds: number; health: number }[] = [];
  private seconds = 0;
  update(detector: DetectorResult, missionHours = 6): HealthResult {
    this.seconds += 0.1;
    if (detector.anomalyDetected && detector.faultType !== "SENSOR_SUSPECT") this.health = Math.max(0, this.health - 0.005);
    this.samples.push({ seconds: this.seconds, health: this.health });
    if (this.samples.length > 600) this.samples.shift();
    const first = this.samples[0]; const last = this.samples[this.samples.length - 1];
    const slopePerHour = this.samples.length > 30 ? (last.health - first.health) / Math.max(0.001, (last.seconds - first.seconds) / 3600) : 0;
    const enoughTrend = this.samples.length > 30 && Math.abs(slopePerHour) > 0.01;
    const rulHours = enoughTrend && slopePerHour < 0 ? Math.max(0, (this.health - 30) / -slopePerHour) : null;
    const projection = Array.from({ length: 25 }, (_, index) => {
      const time = index * 5;
      const center = rulHours === null ? this.health : Math.max(0, this.health + slopePerHour * time);
      const spread = rulHours === null ? 0.3 + index * 0.1 : 0.5 + index * 0.8;
      return { time, health: center, lower: Math.max(0, center - spread), upper: Math.min(100, center + spread) };
    });
    const hazardPerHour = Math.max(0.001, (100 - this.health) / 100 * 0.025 + (detector.anomalyDetected ? 0.055 : 0));
    const missionReliability = Math.exp(-hazardPerHour * missionHours);
    const recommendation = missionReliability < 0.65 || this.health < 45 ? "RETURN" : missionReliability < 0.9 || detector.anomalyDetected ? "CAUTION" : "CONTINUE";
    return { healthIndex: this.health, rulHours, rulProjection: projection, missionReliability, recommendation, trendStatus: rulHours === null ? "INSUFFICIENT TREND" : "ESTIMATED" };
  }
}
