import { useEffect, useState } from "react";
import type { DetectorResult, HealthResult, TelemetryPoint } from "@/sim/types";

export interface MaintenanceAdvisoryProps {
  anomalyDetected: boolean;
  detector: DetectorResult | null;
  health: HealthResult | null;
  telemetry: TelemetryPoint | null;
}

function Typewriter({ text, tone }: { text: string; tone: "rose" | "amber" | "emerald" }) {
  const [visibleChars, setVisibleChars] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setVisibleChars((count) => {
      const next = Math.min(text.length, count + 1);
      if (next >= text.length) clearInterval(timer);
      return next;
    }), 30);
    return () => clearInterval(timer);
  }, [text]);
  const color = tone === "rose" ? "text-rose-400" : tone === "amber" ? "text-amber-400" : "text-zinc-300";
  return <div className={color}><span>{text.slice(0, visibleChars)}</span>{visibleChars < text.length && <span className={`inline-block w-2 h-3.5 ${tone === "rose" ? "bg-rose-500" : tone === "amber" ? "bg-amber-500" : "bg-emerald-500"} ml-1 align-middle animate-blink`} />}</div>;
}

export function MaintenanceAdvisory({ anomalyDetected, detector, health, telemetry }: MaintenanceAdvisoryProps) {
  const fault = detector?.faultType ?? "NONE";
  const component = detector?.componentId?.replace("_", " ").toUpperCase() ?? "ENGINE";
  const residual = detector ? String(Math.round(detector.residual)) : "0";
  const healthValue = (health?.healthIndex ?? 100).toFixed(1);
  const reliability = ((health?.missionReliability ?? 1) * 100).toFixed(1);
  const rul = health?.rulHours === null || health?.rulHours === undefined ? "insufficient trend" : `${health.rulHours.toFixed(1)} estimated hours`;
  const message = fault === "SENSOR_SUSPECT"
    ? `SENSOR CHECK: ${component} channel diverges from correlated exhaust and fuel-flow channels by ${residual} sigma. Engine health remains ${healthValue}. Verify the CHT sensor and wiring before maintenance action.`
    : anomalyDetected
      ? `${fault} indication at ${component}. Physics residual ${residual} sigma. Engine health ${healthValue}; estimated RUL ${rul}; mission reliability ${reliability}%. Review oil pressure ${Math.round(telemetry?.oilPressure ?? 0)} psi and telemetry before dispatch.`
      : `Nominal simulated operation. Health ${healthValue}; six-hour mission reliability ${reliability}%; maximum residual ${residual} sigma. RUL status: ${rul}.`;
  const tone = fault === "SENSOR_SUSPECT" ? "amber" : anomalyDetected ? "rose" : "emerald";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 min-h-[160px] flex flex-col">
      <div className="text-zinc-400 text-xs tracking-wider uppercase mb-3 font-semibold">AI MAINTENANCE ADVISORY</div>
      <div className="font-mono text-sm leading-relaxed flex-1"><Typewriter text={message} tone={tone} /></div>
      <div className="mt-3 border-t border-zinc-800 pt-2 text-[10px] font-mono text-zinc-500">Template-based demo advisory. LLM integration planned. Draft, requires technician review.</div>
    </div>
  );
}
