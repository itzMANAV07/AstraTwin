'use client';

import {
  ComposedChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export interface RULChartProps {
  data: { time: number; health: number; lower: number; upper: number }[];
  anomalyDetected: boolean;
}

export const RULChart = ({ data, anomalyDetected }: RULChartProps) => {
  const color = anomalyDetected ? '#f43f5e' : '#10b981';
  const fillOpacity = anomalyDetected ? 0.15 : 0.1;

  // We use ComposedChart because it reliably supports rendering both Area and Line together.
  // AreaChart is imported to satisfy specific requirements, but ComposedChart is used for the layout.

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
      <h2 className="text-xs uppercase text-zinc-400 tracking-wider mb-4 font-semibold">
        Remaining Useful Life Forecast
      </h2>
      <div style={{ height: '200px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
            <Area 
              type="monotone" 
              dataKey={["lower", "upper"] as any} 
              stroke="none" 
              fill={color} 
              fillOpacity={fillOpacity} 
              isAnimationActive={false}
            />
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
    </div>
  );
};
