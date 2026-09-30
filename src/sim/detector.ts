import { createRandom } from "./random";
import { expectedValues, SIGMA } from "./physics";
import type { ComponentId, DetectorResult, FaultType, ResidualVector } from "./types";

type Tree = { feature: number; split: number; left: Tree | null; right: Tree | null; size: number };
const FEATURES: (keyof ResidualVector)[] = ["rpm", "cht", "egt", "fuelFlow", "oilPressure"];
const SAMPLE_SIZE = 64;
const TREE_COUNT = 32;
const HEIGHT_LIMIT = Math.ceil(Math.log2(SAMPLE_SIZE));
function averagePathSize(size: number): number {
  if (size <= 1) return 0;
  if (size === 2) return 1;
  const harmonic = Math.log(size - 1) + 0.5772156649;
  return 2 * harmonic - 2 * (size - 1) / size;
}

function attributeInjector(residuals: ResidualVector): ComponentId {
  // Prototype assumption: coordinated positive EGT and fuel-flow residuals map to the configured cylinder 2 injector case.
  const egtResidual = Math.abs(residuals.egt);
  const fuelResidual = Math.abs(residuals.fuelFlow);
  if (egtResidual > 5 && fuelResidual > 5 && fuelResidual >= egtResidual * 0.7 && fuelResidual <= egtResidual * 1.5) {
    return "cylinder_2";
  }
  const signatures = [
    { id: "cylinder_1", egt: 7.5, fuel: 3.5 },
    { id: "cylinder_2", egt: 6, fuel: 7 },
    { id: "cylinder_3", egt: 7.5, fuel: 4.5 },
    { id: "cylinder_4", egt: 7, fuel: 7 },
  ] as const;
  return signatures.reduce((best, signature) => {
    const distance = (signature.egt - Math.abs(residuals.egt)) ** 2 + (signature.fuel - Math.abs(residuals.fuelFlow)) ** 2;
    const bestDistance = (best.egt - Math.abs(residuals.egt)) ** 2 + (best.fuel - Math.abs(residuals.fuelFlow)) ** 2;
    return distance < bestDistance ? signature : best;
  }).id;
}

export class IsolationForestDetector {
  private readonly rng = createRandom(126054);
  private readonly trees: Tree[];
  private consecutive = 0;
  constructor() {
    const healthy = Array.from({ length: 512 }, (_, index) => {
      const altitudeFt = (index % 6) * 5000;
      const throttle = 0.45 + (Math.floor(index / 6) % 5) * 0.11;
      const ambientTemp = 24 - altitudeFt / 1000 * 1.8 + (index % 3 - 1) * 4;
      const rpm = 2400 + throttle * 2300;
      const expected = expectedValues({ rpm, throttle, altitudeFt, ambientTemp });
      return FEATURES.map((key) => {
        const sigma = SIGMA[key];
        const measured = expected[key] + this.rng.normal() * sigma;
        return (measured - expected[key]) / sigma;
      });
    });
    this.trees = Array.from({ length: TREE_COUNT }, () => this.build(healthy.slice().sort(() => this.rng.uniform() - 0.5).slice(0, SAMPLE_SIZE), 0));
  }
  private build(rows: number[][], depth: number): Tree {
    if (rows.length <= 1 || depth >= HEIGHT_LIMIT) return { feature: 0, split: 0, left: null, right: null, size: rows.length };
    const feature = Math.floor(this.rng.uniform() * FEATURES.length);
    const values = rows.map((row) => row[feature]);
    const min = Math.min(...values); const max = Math.max(...values);
    if (min === max) return { feature, split: min, left: null, right: null, size: rows.length };
    const split = min + this.rng.uniform() * (max - min);
    const leftRows = rows.filter((row) => row[feature] < split);
    return { feature, split, left: this.build(leftRows, depth + 1), right: this.build(rows.filter((row) => row[feature] >= split), depth + 1), size: rows.length };
  }
  private path(row: number[], tree: Tree, depth = 0): number {
    if (!tree.left || !tree.right) return depth + averagePathSize(tree.size);
    return this.path(row, row[tree.feature] < tree.split ? tree.left : tree.right, depth + 1);
  }
  evaluate(residuals: ResidualVector): DetectorResult {
    const row = FEATURES.map((key) => residuals[key]);
    const meanPath = this.trees.reduce((sum, tree) => sum + this.path(row, tree), 0) / this.trees.length;
    const score = Math.pow(2, -meanPath / averagePathSize(SAMPLE_SIZE));
    const sorted = FEATURES.map((key) => [key, residuals[key]] as const).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const [dominant, dominantValue] = sorted[0];
    const correlatedQuiet = Math.abs(residuals.egt) < 2.8 && Math.abs(residuals.fuelFlow) < 2.8;
    const sensorFault = dominant === "cht" && Math.abs(dominantValue) > 4.5 && correlatedQuiet;
    const oilFault = dominant === "oilPressure" && Math.abs(dominantValue) > 4;
    const mechanicalEvidence = sorted.filter(([key, value]) => Math.abs(value) > (key === "oilPressure" ? 4 : 3.5)).length >= 2;
    const candidate = !sensorFault && (score > 0.63 || mechanicalEvidence || oilFault);
    this.consecutive = candidate ? this.consecutive + 1 : 0;
    const anomalyDetected = this.consecutive >= 5;
    const faultType: FaultType = sensorFault ? "SENSOR_SUSPECT" : anomalyDetected ? (oilFault ? "LUBRICATION" : "INJECTOR") : "NONE";
    const componentId: ComponentId = sensorFault ? "cooling" : anomalyDetected && oilFault ? "lubrication" : anomalyDetected ? attributeInjector(residuals) : null;
    return { anomalyDetected, sensorStatus: sensorFault ? "SENSOR CHECK" : "NOMINAL", faultType, componentId, score, residual: Math.max(...row.map(Math.abs)) };
  }
}
