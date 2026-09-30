import { memo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip
} from 'recharts';

export interface RULChartProps {
  data: { time: number; health: number; lower: number; upper: number }[];
  anomalyDetected: boolean;
  missionReliability: number;
  recommendation: "CONTINUE" | "CAUTION" | "RETURN";
  sensorStatus: "NOMINAL" | "SENSOR CHECK";
  rulHours: number | null;
  trendStatus: "ESTIMATED" | "INSUFFICIENT TREND";
}

export const RULChart = memo(({ data, anomalyDetected, missionReliability, recommendation, sensorStatus, rulHours, trendStatus }: RULChartProps) => {
  const color = anomalyDetected ? '#f43f5e' : '#10b981';
  const fillOpacity = anomalyDetected ? 0.15 : 0.1;
  const chartData = data.map((point) => ({ ...point, cone: point.upper - point.lower }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
        <h2 className="text-xs uppercase text-zinc-400 tracking-wider mb-4 font-semibold">
        Remaining Useful Life Forecast
      </h2>
      <div style={{ height: '200px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
              label={{ value: 'Flight Hours (Projected)', position: 'insideBottom', offset: -15, fill: '#71717a', fontSize: 11 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Health Index', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }}
            />
            <ReferenceLine 
              y={30} 
              stroke="#f43f5e" 
              strokeDasharray="3 3" 
              label={{ value: 'FAILURE THRESHOLD', fill: '#f43f5e', fontSize: 10, position: 'insideTopLeft' }} 
            />
            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: 0 }} labelStyle={{ color: '#a1a1aa' }} itemStyle={{ color }} />
            <Area type="monotone" dataKey="lower" stackId="cone" stroke="none" fill={color} fillOpacity={0} isAnimationActive={false} />
            <Area type="monotone" dataKey="cone" stackId="cone" stroke="none" fill={color} fillOpacity={fillOpacity} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="health"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="border border-zinc-800 bg-zinc-950/70 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Mission Reliability</div>
          <div className="font-mono text-sm text-cyan-400">{(missionReliability * 100).toFixed(1)}% <span className="text-[10px] text-zinc-400">{recommendation}</span></div>
        </div>
        <div className="border border-zinc-800 bg-zinc-950/70 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Sensor Status</div>
          <div className={`font-mono text-sm ${sensorStatus === 'SENSOR CHECK' ? 'text-amber-400' : 'text-emerald-400'}`}>{sensorStatus}</div>
        </div>
      </div>
      <div className="mt-2 font-mono text-[10px] text-zinc-600">RUL {rulHours === null ? trendStatus : `${rulHours.toFixed(1)} estimated hours`}</div>
    </div>
  );
});
