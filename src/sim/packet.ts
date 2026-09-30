import type { DetectorResult, HealthResult, TelemetryPoint } from "./types";

export const HEALTH_PACKET_BYTES = 32;
export const RAW_FRAME_BYTES = 36; // timestamp plus eight Float32-like channels per 10 Hz sample
export const PACKET_PROTOCOL_OVERHEAD_BYTES = 8; // reserved framing/checksum bytes included in the 32-byte packet

export interface HealthPacket { timestamp: number; rpm: number; cht: number; egt: number; fuelFlow: number; oilPressure: number; altitudeFt: number; ambientTemp: number; throttle: number; healthIndex: number; residual: number; score: number; faultCode: number; componentCode: number; reliability: number; rulHours: number }
const faultCodes = { NONE: 0, INJECTOR: 1, LUBRICATION: 2, SENSOR_SUSPECT: 3 } as const;
const componentCodes: Record<string, number> = { cylinder_1: 1, cylinder_2: 2, cylinder_3: 3, cylinder_4: 4, lubrication: 5, cooling: 6 };

export function encodeHealthPacket(point: TelemetryPoint, detector: DetectorResult, health: HealthResult): Uint8Array {
  const bytes = new Uint8Array(HEALTH_PACKET_BYTES); const view = new DataView(bytes.buffer);
  view.setUint32(0, point.timestamp >>> 0, true);
  view.setUint16(4, point.rpm, true); view.setInt16(6, Math.round(point.cht * 10), true); view.setUint16(8, point.egt, true);
  view.setUint16(10, Math.round(point.fuelFlow * 10), true); view.setUint16(12, Math.round(point.oilPressure * 10), true);
  view.setUint16(14, Math.min(65535, point.altitudeFt), true); view.setInt16(16, Math.round(point.ambientTemp * 10), true);
  view.setUint8(18, Math.round(point.throttle * 100)); view.setUint8(19, Math.round(health.healthIndex));
  view.setUint16(20, Math.round(detector.residual * 100), true); view.setUint8(22, Math.round(detector.score * 100));
  view.setUint8(23, faultCodes[detector.faultType]); view.setUint8(24, detector.componentId ? componentCodes[detector.componentId] : 0);
  view.setUint8(25, Math.round(health.missionReliability * 100)); view.setFloat32(26, health.rulHours ?? -1, true);
  view.setUint8(30, detector.sensorStatus === "SENSOR CHECK" ? 1 : 0); view.setUint8(31, PACKET_PROTOCOL_OVERHEAD_BYTES);
  return bytes;
}

export function decodeHealthPacket(bytes: Uint8Array): HealthPacket {
  if (bytes.byteLength !== HEALTH_PACKET_BYTES) throw new Error(`Expected ${HEALTH_PACKET_BYTES} bytes`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { timestamp: view.getUint32(0, true), rpm: view.getUint16(4, true), cht: view.getInt16(6, true) / 10, egt: view.getUint16(8, true), fuelFlow: view.getUint16(10, true) / 10, oilPressure: view.getUint16(12, true) / 10, altitudeFt: view.getUint16(14, true), ambientTemp: view.getInt16(16, true) / 10, throttle: view.getUint8(18) / 100, healthIndex: view.getUint8(19), residual: view.getUint16(20, true) / 100, score: view.getUint8(22) / 100, faultCode: view.getUint8(23), componentCode: view.getUint8(24), reliability: view.getUint8(25) / 100, rulHours: view.getFloat32(26, true) };
}
