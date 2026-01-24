import { useMemo } from "react";
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
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { TaskStatus } from "../../../schemas/task.schema.js";

const COLORS = {
  [TaskStatus.PENDING]: "#f59e0b",
  [TaskStatus.IN_PROGRESS]: "#3b82f6",
  [TaskStatus.COMPLETED]: "#10b981",
};

const STATUS_LABELS = {
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.COMPLETED]: "Completed",
};

const STATUS_ICONS = {
  [TaskStatus.PENDING]: "⏳",
  [TaskStatus.IN_PROGRESS]: "🔄",
  [TaskStatus.COMPLETED]: "✅",
};

export function TaskStats({ tasks }) {
  // Calculate all statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS,
    ).length;
    const completed = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED,
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // Deadline analysis
    const now = new Date();
    const tasksWithDeadline = tasks.filter(
      (t) => t.deadline && t.status !== TaskStatus.COMPLETED,
    );
    const overdue = tasksWithDeadline.filter(
      (t) => new Date(t.deadline) < now,
    ).length;
    const dueSoon = tasksWithDeadline.filter((t) => {
      const deadline = new Date(t.deadline);
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 3;
    }).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate,
      overdue,
      dueSoon,
    };
  }, [tasks]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    return Object.values(TaskStatus).map((status) => ({
      name: STATUS_LABELS[status],
      value: tasks.filter((t) => t.status === status).length,
      color: COLORS[status],
    }));
  }, [tasks]);

  // Weekly activity data
  const weeklyData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map((date) => {
      const dayTasks = tasks.filter(
        (t) => new Date(t.createdAt).toISOString().split("T")[0] === date,
      );
      return {
        date: new Date(date).toLocaleDateString("en", { weekday: "short" }),
        fullDate: new Date(date).toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
        created: dayTasks.length,
        completed: dayTasks.filter((t) => t.status === TaskStatus.COMPLETED)
          .length,
      };
    });
  }, [tasks]);

  // Productivity trend (cumulative completed over time)
  const productivityData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    let cumulative = 0;
    return last7Days.map((date) => {
      const completedOnDay = tasks.filter((t) => {
        if (t.status !== TaskStatus.COMPLETED) return false;
        const taskDate = new Date(t.createdAt).toISOString().split("T")[0];
        return taskDate <= date;
      }).length;
      cumulative = completedOnDay;
      return {
        date: new Date(date).toLocaleDateString("en", { weekday: "short" }),
        completed: cumulative,
      };
    });
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">
            Track your productivity and progress
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">
            {stats.completionRate}%
          </div>
          <div className="text-xs text-gray-400">Overall Completion</div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon="📊"
          gradient="from-violet-500 to-purple-600"
          glowColor="violet"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon="⏳"
          gradient="from-amber-500 to-orange-600"
          glowColor="amber"
          trend={stats.pending > 0 ? "needs attention" : null}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon="🔄"
          gradient="from-blue-500 to-cyan-600"
          glowColor="blue"
          trend={stats.inProgress > 0 ? "active" : null}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon="✅"
          gradient="from-emerald-500 to-green-600"
          glowColor="emerald"
          subtitle={`${stats.completionRate}% done`}
        />
      </div>

      {/* Deadline Alerts - Only show if there are issues */}
      {(stats.overdue > 0 || stats.dueSoon > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.overdue > 0 && (
            <AlertCard
              type="danger"
              title="Overdue Tasks"
              value={stats.overdue}
              message={`${stats.overdue} task${stats.overdue !== 1 ? "s" : ""} past deadline`}
              icon="🚨"
            />
          )}
          {stats.dueSoon > 0 && (
            <AlertCard
              type="warning"
              title="Due Soon"
              value={stats.dueSoon}
              message={`${stats.dueSoon} task${stats.dueSoon !== 1 ? "s" : ""} due within 3 days`}
              icon="⚠️"
            />
          )}
        </div>
      )}

      {/* Progress Ring & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Ring */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Completion Rate
          </h3>
          <div className="flex flex-col items-center">
            <ProgressRing percentage={stats.completionRate} size={160} />
            <div className="mt-4 grid grid-cols-3 gap-4 w-full">
              {Object.values(TaskStatus).map((status) => (
                <div key={status} className="text-center">
                  <div className="text-xs text-gray-400">
                    {STATUS_LABELS[status]}
                  </div>
                  <div
                    className="text-lg font-semibold"
                    style={{ color: COLORS[status] }}
                  >
                    {tasks.filter((t) => t.status === status).length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Task Distribution
          </h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-gray-300 text-sm">{value}</span>
                  )}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No tasks yet" />
          )}
        </div>

        {/* Productivity Trend */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Productivity Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient
                  id="completedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#completedGradient)"
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500"></div>
              <span className="text-gray-400">Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-400">Completed</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData} barGap={8}>
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
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar
              dataKey="created"
              name="Created"
              fill="#8b5cf6"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Insights */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            icon="🎯"
            title="Focus Area"
            value={
              stats.inProgress > 0
                ? `${stats.inProgress} active`
                : "No active tasks"
            }
            description={
              stats.inProgress > 0
                ? "Tasks currently in progress"
                : "Start working on pending tasks"
            }
            color="blue"
          />
          <InsightCard
            icon="📈"
            title="This Week"
            value={`${weeklyData.reduce((sum, d) => sum + d.created, 0)} created`}
            description={`${weeklyData.reduce((sum, d) => sum + d.completed, 0)} completed this week`}
            color="violet"
          />
          <InsightCard
            icon="⚡"
            title="Velocity"
            value={stats.total > 0 ? `${stats.completionRate}%` : "N/A"}
            description={
              stats.completionRate >= 75
                ? "Great progress!"
                : stats.completionRate >= 50
                  ? "Good momentum"
                  : "Keep pushing!"
            }
            color="emerald"
          />
        </div>
      </div>
    </div>
  );
}

// Enhanced Stat Card with glow effect
function StatCard({
  title,
  value,
  icon,
  gradient,
  glowColor,
  subtitle,
  trend,
}) {
  const glowClasses = {
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    blue: "shadow-blue-500/20",
    emerald: "shadow-emerald-500/20",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-lg ${glowClasses[glowColor]} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className="text-3xl">{icon}</span>
          <span className="text-4xl font-bold text-white">{value}</span>
        </div>
        <p className="mt-3 text-sm font-medium text-white/90">{title}</p>
        {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
        {trend && (
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-white/20 text-white">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

// Alert Card for deadlines
function AlertCard({ type, title, value, message, icon }) {
  const styles = {
    danger: "from-red-500/20 to-red-600/20 border-red-500/30",
    warning: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
  };

  const textColors = {
    danger: "text-red-400",
    warning: "text-amber-400",
  };

  return (
    <div
      className={`glass rounded-xl p-4 border bg-gradient-to-r ${styles[type]}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${textColors[type]}`}>
              {value}
            </span>
            <span className={`text-sm ${textColors[type]}`}>{title}</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Custom Progress Ring
function ProgressRing({ percentage, size = 120 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{percentage}%</span>
        <span className="text-xs text-gray-400">Complete</span>
      </div>
    </div>
  );
}

// Insight Card
function InsightCard({ icon, title, value, description, color }) {
  const borderColors = {
    blue: "border-l-blue-500",
    violet: "border-l-violet-500",
    emerald: "border-l-emerald-500",
  };

  return (
    <div
      className={`bg-slate-800/50 rounded-xl p-4 border-l-4 ${borderColors[color]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-lg font-semibold text-white mt-0.5">{value}</p>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// Empty State
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] text-center">
      <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
        <svg
          className="w-8 h-8 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
