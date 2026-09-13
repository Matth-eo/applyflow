"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  const total = data.reduce((sum, day) => sum + day.count, 0);
  return (
    <section className="panel p-6">
      <h2 className="font-semibold">Applications created per day</h2>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Last 30 days · UTC · {total} applications
      </p>
      <div
        className="h-64 w-full"
        role="img"
        aria-label="Daily application creation totals; exact values are available in the data table below."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => String(value).slice(5)}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              minTickGap={30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar
              dataKey="count"
              name="Applications"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!total && (
        <p className="mt-3 text-sm text-muted-foreground">
          No applications were created during this period.
        </p>
      )}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-primary">View daily totals</summary>
        <div className="mt-3 max-h-48 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th scope="col">Date (UTC)</th>
                <th scope="col">Applications</th>
              </tr>
            </thead>
            <tbody>
              {data.map((day) => (
                <tr key={day.date}>
                  <td className="py-1">{day.date}</td>
                  <td>{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
