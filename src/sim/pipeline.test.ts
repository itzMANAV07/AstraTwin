import { describe, expect, it } from "vitest";
import { residuals, expectedValues } from "./physics";
import { IsolationForestDetector } from "./detector";
import { HealthEstimator } from "./health";
import { decodeHealthPacket, encodeHealthPacket } from "./packet";
import { EngineSimulator } from "./engine";
import type { TelemetryPoint } from "./types";

const operating = { rpm: 4100, throttle: 0.74, altitudeFt: 0, ambientTemp: 22 };
const healthyPoint = (altitudeFt: number) => {
  const op = { ...operating, altitudeFt, ambientTemp: 22 - altitudeFt / 1000 * 1.8 };
  return { ...expectedValues(op), altitudeFt: op.altitudeFt, ambientTemp: op.ambientTemp, throttle: op.throttle };
};

describe("simulated edge pipeline", () => {
  it("round-trips the compact health packet", () => {
    const point: TelemetryPoint = { timestamp: 123456, rpm: 4200, cht: 181.2, egt: 695, fuelFlow: 21.4, oilPressure: 71.5, altitudeFt: 8200, ambientTemp: 7.3, throttle: 0.78, physicsResidual: 1.25, healthIndex: 93, anomalyDetected: true };
    const detector = { anomalyDetected: true, sensorStatus: "NOMINAL" as const, faultType: "INJECTOR" as const, componentId: "cylinder_2" as const, score: 0.8, residual: 4.25 };
    const health = { healthIndex: 93, rulHours: 12.5, rulProjection: [], missionReliability: 0.82, recommendation: "CAUTION" as const, trendStatus: "ESTIMATED" as const };
    const decoded = decodeHealthPacket(encodeHealthPacket(point, detector, health));
    expect(decoded).toMatchObject({ timestamp: point.timestamp, rpm: point.rpm, cht: point.cht, altitudeFt: point.altitudeFt, componentCode: 2, reliability: 0.82 });
  });

  it("keeps healthy residuals centered across altitude", () => {
    for (const altitudeFt of [0, 8000, 16000, 25000]) {
      const frame = healthyPoint(altitudeFt);
      const result = residuals(frame, { ...operating, altitudeFt, ambientTemp: frame.ambientTemp });
      expect(Math.max(...Object.values(result).map(Math.abs))).toBeLessThan(0.01);
    }
  });

  it("raises residuals for injector and oil faults", () => {
    const healthy = healthyPoint(0);
    const injector = residuals({ ...healthy, egt: healthy.egt + 48, fuelFlow: healthy.fuelFlow + 5.8 }, operating);
    const oil = residuals({ ...healthy, oilPressure: healthy.oilPressure - 20 }, operating);
    expect(injector.egt).toBeGreaterThan(4);
    expect(injector.fuelFlow).toBeGreaterThan(4);
    expect(oil.oilPressure).toBeLessThan(-4);
  });

  it("marks isolated CHT drift as a sensor check without reducing health", () => {
    const detector = new IsolationForestDetector();
    const estimator = new HealthEstimator();
    const before = estimator.update({ anomalyDetected: false, sensorStatus: "NOMINAL", faultType: "NONE", componentId: null, score: 0.2, residual: 0 });
    let result = detector.evaluate({ rpm: 0.2, cht: 8, egt: 0.1, fuelFlow: -0.2, oilPressure: 0.3 });
    for (let i = 0; i < 20; i++) result = detector.evaluate({ rpm: 0.2, cht: 8, egt: 0.1, fuelFlow: -0.2, oilPressure: 0.3 });
    const after = estimator.update(result);
    expect(result.sensorStatus).toBe("SENSOR CHECK");
    expect(result.anomalyDetected).toBe(false);
    expect(after.healthIndex).toBe(before.healthIndex);
  });

  it("confirms a mechanical anomaly only after persistent windows", () => {
    const detector = new IsolationForestDetector();
    const fault = { rpm: 0, cht: 0, egt: 7, fuelFlow: 7, oilPressure: 0 };
    for (let index = 0; index < 4; index++) expect(detector.evaluate(fault).anomalyDetected).toBe(false);
    expect(detector.evaluate(fault).anomalyDetected).toBe(true);
  });

  it("keeps the altitude-aware detector quiet through a climb that crosses the fixed EGT threshold", () => {
    const engine = new EngineSimulator(); const detector = new IsolationForestDetector();
    let last = detector.evaluate({ rpm: 0, cht: 0, egt: 0, fuelFlow: 0, oilPressure: 0 });
    let crossedThreshold = false;
    for (let index = 0; index < 780; index++) {
      const frame = engine.tick("HIGH_ALTITUDE");
      const vector = residuals(frame, { rpm: frame.rpm, throttle: frame.throttle, altitudeFt: frame.altitudeFt, ambientTemp: frame.ambientTemp });
      last = detector.evaluate(vector);
      crossedThreshold ||= frame.egt > 750;
    }
    expect(crossedThreshold).toBe(true);
    expect(last.anomalyDetected).toBe(false);
  });

  it("detects the injector scenario at the configured cylinder", () => {
    const engine = new EngineSimulator(); const detector = new IsolationForestDetector();
    let last = detector.evaluate({ rpm: 0, cht: 0, egt: 0, fuelFlow: 0, oilPressure: 0 });
    for (let index = 0; index < 180; index++) {
      const frame = engine.tick("ANOMALY");
      const vector = residuals(frame, { rpm: frame.rpm, throttle: frame.throttle, altitudeFt: frame.altitudeFt, ambientTemp: frame.ambientTemp });
      last = detector.evaluate(vector);
    }
    expect(last.anomalyDetected).toBe(true);
    expect(last.componentId).toBe("cylinder_2");
  });

  it("detects oil pressure loss as lubrication trouble and decreases health", () => {
    const engine = new EngineSimulator(); const detector = new IsolationForestDetector(); const estimator = new HealthEstimator();
    let result = detector.evaluate({ rpm: 0, cht: 0, egt: 0, fuelFlow: 0, oilPressure: 0 });
    let health = estimator.update(result);
    for (let index = 0; index < 100; index++) {
      const frame = engine.tick("OIL_PRESSURE_LOSS");
      result = detector.evaluate(residuals(frame, { rpm: frame.rpm, throttle: frame.throttle, altitudeFt: frame.altitudeFt, ambientTemp: frame.ambientTemp }));
      health = estimator.update(result);
    }
    expect(result.anomalyDetected).toBe(true);
    expect(result.componentId).toBe("lubrication");
    expect(health.healthIndex).toBeLessThan(100);
  });

  it("keeps health unchanged while the simulated CHT sensor drifts", () => {
    const engine = new EngineSimulator(); const detector = new IsolationForestDetector(); const estimator = new HealthEstimator();
    let result = detector.evaluate({ rpm: 0, cht: 0, egt: 0, fuelFlow: 0, oilPressure: 0 });
    let health = estimator.update(result);
    for (let index = 0; index < 300; index++) {
      const frame = engine.tick("SENSOR_DRIFT");
      result = detector.evaluate(residuals(frame, { rpm: frame.rpm, throttle: frame.throttle, altitudeFt: frame.altitudeFt, ambientTemp: frame.ambientTemp }));
      health = estimator.update(result);
    }
    expect(result.sensorStatus).toBe("SENSOR CHECK");
    expect(result.anomalyDetected).toBe(false);
    expect(health.healthIndex).toBe(100);
  });
});
