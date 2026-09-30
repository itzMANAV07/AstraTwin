import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip
} from 'recharts';

export interface TelemetryChartProps {
  data: { timestamp: number; value: number }[];
  label: string;
  color: string;
  unit: string;
  warningThreshold?: number;
  currentValue: number;
}

export const TelemetryChart = memo(({ 
  data,
  label,
  color,
  unit,
  warningThreshold,
  currentValue
}: TelemetryChartProps) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3">
      <div className="flex justify-between items-end mb-2">
        <span className="font-bold text-sm text-zinc-300">{label}</span>
        <span className="text-xl font-medium" style={{ color }}>
          {currentValue.toFixed(1)} <span className="text-xs text-zinc-500">{unit}</span>
        </span>
      </div>
      <div style={{ height: '120px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="timestamp" hide />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            {warningThreshold !== undefined && (
              <ReferenceLine y={warningThreshold} stroke="#f43f5e" strokeDasharray="3 3" />
            )}
            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: 0 }} labelStyle={{ color: '#a1a1aa' }} itemStyle={{ color }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
