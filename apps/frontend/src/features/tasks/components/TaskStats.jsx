import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TaskStatus } from "../../../schemas/task.schema.js";

const COLORS = {
  [TaskStatus.PENDING]: "#f59e0b",
  [TaskStatus.IN_PROGRESS]: "#3b82f6",
  [TaskStatus.COMPLETED]: "#10b981",
};

const STATUS_LABELS = {
  [TaskStatus.PENDING]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.COMPLETED]: "Completed",
};

export function TaskStats({ tasks }) {
  // Calculate status distribution
  const statusData = Object.values(TaskStatus).map((status) => ({
    name: STATUS_LABELS[status],
    value: tasks.filter((t) => t.status === status).length,
    color: COLORS[status],
  }));

  // Calculate tasks by day (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const tasksByDay = last7Days.map((date) => {
    const dayTasks = tasks.filter(
      (t) => new Date(t.createdAt).toISOString().split("T")[0] === date,
    );
    return {
      date: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      created: dayTasks.length,
      completed: dayTasks.filter((t) => t.status === TaskStatus.COMPLETED)
        .length,
    };
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === TaskStatus.COMPLETED,
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon="📊"
          color="from-purple-500/20 to-pink-500/20"
        />
        <StatCard
          title="To Do"
          value={tasks.filter((t) => t.status === TaskStatus.PENDING).length}
          icon="📋"
          color="from-amber-500/20 to-orange-500/20"
        />
        <StatCard
          title="In Progress"
          value={
            tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
          }
          icon="🔄"
          color="from-blue-500/20 to-cyan-500/20"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon="✅"
          color="from-emerald-500/20 to-green-500/20"
          subtitle={`${completionRate}% done`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Task Distribution
          </h3>
          {totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f8fafc" }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-gray-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No tasks yet
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tasksByDay}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f8fafc" }}
              />
              <Bar
                dataKey="created"
                name="Created"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} backdrop-blur-sm border border-white/10 rounded-xl p-4`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="mt-2 text-sm text-gray-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
