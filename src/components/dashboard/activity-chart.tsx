"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface DataPoint {
  day: string;
  conversas: number;
  agendamentos: number;
}

export function ActivityChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="rounded-xl border border-border bg-bg-base p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 ease-out-soft">
      <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-lg text-text-primary">
            Conversas e agendamentos
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Últimos 30 dias
          </p>
        </div>
      </header>

      <div className="h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-conversas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A5490" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#1A5490" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-agendamentos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#40E0D0" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#40E0D0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#8AA0B5" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8AA0B5" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255, 255, 255, 0.96)",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                fontSize: "12px",
                fontFamily: "var(--font-body)",
                boxShadow: "0 12px 24px -8px rgba(13, 59, 102, 0.18)",
                backdropFilter: "blur(8px)",
              }}
              labelStyle={{ color: "#0D3B66", fontWeight: 700, marginBottom: 4 }}
              cursor={{ stroke: "#40E0D0", strokeWidth: 1.5, strokeDasharray: "3 3" }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="conversas"
              stroke="#1A5490"
              strokeWidth={2.4}
              fill="url(#grad-conversas)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#FFFFFF" }}
              name="Conversas"
            />
            <Area
              type="monotone"
              dataKey="agendamentos"
              stroke="#40E0D0"
              strokeWidth={2.4}
              fill="url(#grad-agendamentos)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#FFFFFF" }}
              name="Agendamentos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
