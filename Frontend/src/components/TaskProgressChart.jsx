import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const barColors = ["#64748b", "#dc6803", "#039855"];

export default function TaskProgressChart({ stats }) {
  if (!stats) {
    return null;
  }

  const chartData = [
    {
      name: "Todo",
      tasks: stats.todo,
    },
    {
      name: "In Progress",
      tasks: stats.inProgress,
    },
    {
      name: "Done",
      tasks: stats.done,
    },
  ];

  return (
    <section className="progress-chart">
      <div className="progress-chart__header">
        <div>
          <h2 className="progress-chart__title">Task progress</h2>

          <p className="progress-chart__subtitle">
            Live distribution of tasks across the workflow.
          </p>
        </div>

        <div className="progress-chart__completion">
          <strong>{stats.completionPercentage}%</strong>
          <span>completed</span>
        </div>
      </div>

      <div
        className="progress-chart__container"
        role="img"
        aria-label={`Task progress: ${stats.todo} todo, ${stats.inProgress} in progress, and ${stats.done} completed`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="rgba(16, 24, 40, 0.09)"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#667085",
                fontSize: 12,
              }}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#667085",
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={{
                fill: "rgba(91, 91, 214, 0.06)",
              }}
              contentStyle={{
                border: "1px solid rgba(16, 24, 40, 0.09)",
                borderRadius: "10px",
                boxShadow: "0 12px 32px rgba(16, 24, 40, 0.08)",
              }}
            />

            <Bar
              dataKey="tasks"
              name="Tasks"
              radius={[8, 8, 0, 0]}
              maxBarSize={72}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={barColors[index]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}