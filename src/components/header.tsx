'use client'

import React from 'react';

export interface HeaderProps {
  mode: 'NORMAL' | 'HIGH_ALTITUDE' | 'ANOMALY';
  healthIndex: number;
  physicsResidual: number;
}

export const Header: React.FC<HeaderProps> = ({ mode, healthIndex, physicsResidual }) => {
  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <span className="font-bold tracking-widest text-emerald-500">ASTRATWIN</span>
        <div className="h-4 w-px bg-zinc-700"></div>
        <span className="text-xs text-zinc-400">DRDO Predictive Maintenance Digital Twin</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-none ${
            mode === 'NORMAL' 
              ? 'bg-emerald-500' 
              : mode === 'HIGH_ALTITUDE' 
                ? 'bg-amber-500' 
                : 'bg-red-500 animate-pulse'
          }`}
        />
        <span className="text-xs font-mono text-zinc-300 uppercase">{mode.replace('_', ' ')}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-500 font-mono">ASYMMETRIC EDGE MODE</span>
        <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-mono rounded-none">
          BANDWIDTH SAVED: 90%
        </div>
      </div>
    </header>
  );
};
