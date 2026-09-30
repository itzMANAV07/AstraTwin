import React from 'react';
import type { EngineMode } from '@/sim/types';

export interface HeaderProps {
  mode: EngineMode;
  healthIndex: number;
  physicsResidual: number;
  bandwidthSavedPercent: number;
  rawBytesPerSecond: number;
  transmittedBytesPerSecond: number;
}

export const Header: React.FC<HeaderProps> = ({ mode, healthIndex, physicsResidual, bandwidthSavedPercent, rawBytesPerSecond, transmittedBytesPerSecond }) => {
  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <span className="font-bold tracking-widest text-emerald-500">ASTRATWIN</span>
        <div className="h-4 w-px bg-zinc-700"></div>
        <span className="text-xs text-zinc-400">Prototype for SIH26054 (simulated data)</span>
      </div>
      
      <div className="flex items-center gap-2" title={`Health ${healthIndex.toFixed(1)} percent, residual ${physicsResidual.toFixed(1)} sigma`}>
        <div 
          className={`w-2 h-2 rounded-none ${
            mode === 'NORMAL' 
              ? 'bg-emerald-500' 
            : mode === 'HIGH_ALTITUDE' 
              ? 'bg-amber-500' 
              : mode === 'SENSOR_DRIFT'
                ? 'bg-amber-500'
                : 'bg-red-500 animate-pulse'
          }`}
        />
        <span className="text-xs font-mono text-zinc-300 uppercase">{mode.replaceAll('_', ' ')}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-500 font-mono">SIMULATED EDGE MODE</span>
        <div title={`Raw ${rawBytesPerSecond.toFixed(0)} bytes/s, transmitted ${transmittedBytesPerSecond.toFixed(0)} bytes/s. Health ${healthIndex.toFixed(1)}, residual ${physicsResidual.toFixed(1)} sigma.`} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-mono rounded-none">
          BANDWIDTH SAVED: {bandwidthSavedPercent.toFixed(1)}% (est.)
        </div>
        <span className="text-[9px] font-mono text-zinc-600">SIMULATED DATA - SIH26054 PROTOTYPE</span>
      </div>
    </header>
  );
};
