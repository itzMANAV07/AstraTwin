import React, { useState, useEffect } from 'react';

export interface MaintenanceAdvisoryProps {
  anomalyDetected: boolean;
  mode: 'NORMAL' | 'HIGH_ALTITUDE' | 'ANOMALY';
}

const NORMAL_MESSAGE = 'SYSTEM OPTIMAL. All parameters within nominal operating envelope. Edge-AI Isolation Forest: No anomalous patterns detected. Next scheduled maintenance: 120 flight hours.';
const ANOMALY_MESSAGE = 'DIAGNOSTIC ALARM: Fuel Flow vs Thermodynamic Baseline deviation > 15%. Isolation Forest confidence: 0.94. ACTION REQUIRED: Isolate Cylinder 2. Inspect injector pulse-width configuration upon UAV recovery. Estimated time to critical failure: 4.2 flight hours.';

export const MaintenanceAdvisory: React.FC<MaintenanceAdvisoryProps> = ({ anomalyDetected, mode }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (mode === 'ANOMALY') {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex++;
        setDisplayedText(ANOMALY_MESSAGE.substring(0, currentIndex));
        if (currentIndex >= ANOMALY_MESSAGE.length) clearInterval(interval);
      }, 30);

      return () => clearInterval(interval);
    }
  }, [mode]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 min-h-[160px] flex flex-col">
      <div className="text-zinc-400 text-xs tracking-wider uppercase mb-3 font-semibold">
        AI MAINTENANCE ADVISORY
      </div>
      <div className="font-mono text-sm leading-relaxed flex-1">
        {!anomalyDetected ? (
          <div className="text-zinc-300 flex items-start mt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 mt-1.5 shrink-0"></span>
            <span>{NORMAL_MESSAGE}</span>
          </div>
        ) : (
          <div className="text-rose-500">
            <span>{displayedText}</span>
            <span className={`inline-block w-2 h-3.5 bg-rose-500 ml-1 align-middle animate-blink`}></span>
          </div>
        )}
      </div>
    </div>
  );
};
