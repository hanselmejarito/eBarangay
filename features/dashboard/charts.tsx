"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GRID = "var(--border)";
const TICK = "var(--muted-foreground)";
const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--card-foreground)",
  fontSize: 12,
};

const PALETTE = [
  "#0038a8",
  "#ce1126",
  "#0f7a3a",
  "#f59e0b",
  "#1d4ed8",
  "#7c3aed",
  "#0ea5e9",
  "#db2777",
];

function ChartFrame({ children }: { children: React.ReactNode }) {
  return <div className="h-72 w-full">{children}</div>;
}

function EmptyChart() {
  return (
    <div className="grid h-72 place-items-center text-sm text-muted-foreground">
      No data yet
    </div>
  );
}

export function MonthlyChart({
  data,
}: {
  data: { month: string; issued: number }[];
}) {
  if (!data.some((d) => d.issued > 0)) return <EmptyChart />;
  return (
    <ChartFrame>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: TICK, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: TICK, fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="issued" name="Issued" fill="#0038a8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function DonutChart({
  data,
  nameKey = "name",
}: {
  data: { name: string; value: number; color?: string }[];
  nameKey?: string;
}) {
  const rows = data.filter((d) => d.value > 0);
  if (rows.length === 0) return <EmptyChart />;
  return (
    <ChartFrame>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey={nameKey}
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
            stroke="none"
          >
            {rows.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color ?? PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function HorizontalBarChart({
  data,
  color = "#0038a8",
}: {
  data: { name: string; value: number }[];
  color?: string;
}) {
  const rows = data.filter((d) => d.value > 0);
  if (rows.length === 0) return <EmptyChart />;
  return (
    <ChartFrame>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fill: TICK, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={132}
            tick={{ fill: TICK, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" name="Count" fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function BudgetCompareChart({
  data,
}: {
  data: { name: string; allocated: number; spent: number }[];
}) {
  if (!data.some((d) => d.allocated > 0 || d.spent > 0)) return <EmptyChart />;
  return (
    <ChartFrame>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fill: TICK, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) =>
              Number(value).toLocaleString("en-PH", { style: "currency", currency: "PHP" })
            }
          />
          <Legend />
          <Bar dataKey="allocated" name="Allocated" fill="#0038a8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="spent" name="Spent" fill="#ce1126" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
