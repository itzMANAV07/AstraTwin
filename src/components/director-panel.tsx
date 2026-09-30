import React from 'react';
import type { EngineMode } from '@/sim/types';

export interface DirectorPanelProps {
  mode: EngineMode;
  onModeChange: (mode: EngineMode) => void;
}

export const DirectorPanel: React.FC<DirectorPanelProps> = ({ mode, onModeChange }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-14 bg-zinc-900/95 backdrop-blur border-t border-zinc-700 z-50 flex items-center justify-between px-6">
      <div className="font-mono text-xs text-zinc-500">
        DIRECTOR CONTROL // VIDEO RECORDING MODE
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onModeChange('NORMAL')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-none border transition-colors ${
            mode === 'NORMAL'
              ? 'bg-zinc-800 border-emerald-500 text-emerald-500'
              : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          SIMULATE NORMAL FLIGHT
        </button>
        <button
          onClick={() => onModeChange('HIGH_ALTITUDE')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-none border transition-colors ${
            mode === 'HIGH_ALTITUDE'
              ? 'bg-zinc-800 border-amber-500 text-amber-500'
              : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          TRIGGER HIGH ALTITUDE
        </button>
        <button
          onClick={() => onModeChange('ANOMALY')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-none border transition-colors ${
            mode === 'ANOMALY'
              ? 'bg-zinc-800 border-rose-500 text-rose-500'
              : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          TRIGGER INJECTOR ANOMALY
        </button>
        <button
          onClick={() => onModeChange('OIL_PRESSURE_LOSS')}
          className={`px-2 py-2 text-[10px] font-mono uppercase tracking-wider rounded-none border transition-colors ${
            mode === 'OIL_PRESSURE_LOSS' ? 'bg-zinc-800 border-cyan-500 text-cyan-500' : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          SIMULATE OIL PRESSURE LOSS
        </button>
        <button
          onClick={() => onModeChange('SENSOR_DRIFT')}
          className={`px-2 py-2 text-[10px] font-mono uppercase tracking-wider rounded-none border transition-colors ${
            mode === 'SENSOR_DRIFT' ? 'bg-zinc-800 border-amber-500 text-amber-500' : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          SIMULATE SENSOR DRIFT
        </button>
      </div>
    </div>
  );
};
