import type { ResidualVector } from "./types";

// Prototype assumptions: ISA troposphere through 11 km, fixed channel noise sigmas,
// and smooth throttle/RPM response. This is a demo baseline, not an engine map.
export function atmosphere(altitudeFt: number) {
  const altitudeM = Math.max(0, altitudeFt) * 0.3048;
  const temperatureK = Math.max(216.65, 288.15 - 0.0065 * Math.min(altitudeM, 11000));
  const pressurePa = 101325 * Math.pow(temperatureK / 288.15, 5.25588);
  return { temperatureC: temperatureK - 273.15, pressurePa, densityRatio: pressurePa / 101325 * 288.15 / temperatureK };
}

export interface OperatingPoint { rpm: number; throttle: number; altitudeFt: number; ambientTemp: number }
export type Channel = keyof ResidualVector;
export const SIGMA: Record<Channel, number> = { rpm: 55, cht: 3.5, egt: 8, fuelFlow: 0.8, oilPressure: 2.5 };

export function expectedValues(point: OperatingPoint): Omit<ResidualVector, "rpm"> & { rpm: number } {
  const air = atmosphere(point.altitudeFt);
  const throttle = Math.max(0.15, Math.min(1, point.throttle));
  const rpm = 2400 + throttle * 2300;
  const rpmLoad = Math.max(0, Math.min(1, (point.rpm - 2400) / 2300));
  const cht = point.ambientTemp + 120 + throttle * 20 + rpmLoad * 20 - (1 - air.densityRatio) * 12;
  const egt = 440 + throttle * 330 + rpmLoad * 100 - (1 - air.densityRatio) * 38;
  const fuelFlow = 4 + (throttle * 0.65 + rpmLoad * 0.35) * 24 * air.densityRatio;
  const oilPressure = 45 + point.rpm / 180 + throttle * 6;
  return { rpm, cht, egt, fuelFlow, oilPressure };
}

export function residuals(measured: ResidualVector, point: OperatingPoint): ResidualVector {
  const expected = expectedValues(point);
  return {
    rpm: (measured.rpm - expected.rpm) / SIGMA.rpm,
    cht: (measured.cht - expected.cht) / SIGMA.cht,
    egt: (measured.egt - expected.egt) / SIGMA.egt,
    fuelFlow: (measured.fuelFlow - expected.fuelFlow) / SIGMA.fuelFlow,
    oilPressure: (measured.oilPressure - expected.oilPressure) / SIGMA.oilPressure,
  };
}
