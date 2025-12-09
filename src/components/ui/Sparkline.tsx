"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const formatted = data.map((value, index) => ({ index, value }));

  return (
    <div className="w-full h-12">
      <ResponsiveContainer>
        <LineChart data={formatted}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
