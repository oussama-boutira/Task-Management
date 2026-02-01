import { useEffect, useRef, useState, useMemo } from "react";
import { TaskCard } from "./TaskCard.jsx";
import { TaskStatus } from "../../../schemas/task.schema.js";

// Section configuration for consistent styling
const sectionConfig = {
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    icon: "🔄",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    defaultCollapsed: false,
  },
  [TaskStatus.PENDING]: {
    label: "Pending",
    icon: "⏳",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    defaultCollapsed: false,
  },
  [TaskStatus.COMPLETED]: {
    label: "Completed",
    icon: "✅",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    defaultCollapsed: true,
  },
};

// Sort options
const SORT_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "deadline", label: "Deadline" },
  { value: "title", label: "Title" },
];

export function TaskList({
  tasks,
  isLoading,
  error,
  onDeleteTask,
  isAdmin = false,
}) {
  const notifiedTasksRef = useRef(new Set());

  // Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Collapsed sections state
  const [collapsedSections, setCollapsedSections] = useState({
    [TaskStatus.COMPLETED]: true,
  });

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Check for deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      tasks.forEach((task) => {
        if (
          task.status !== "completed" &&
          task.deadline &&
          new Date(task.deadline) <= now
        ) {
          if (!notifiedTasksRef.current.has(task.id)) {
            if (Notification.permission === "granted") {
              new Notification("Task Overdue!", {
                body: `The deadline for "${task.title}" has been reached.`,
                icon: "/vite.svg",
              });
            }
            notifiedTasksRef.current.add(task.id);
          }
        }
      });
    };

    const intervalId = setInterval(checkDeadlines, 60000);
    checkDeadlines();
    return () => clearInterval(intervalId);
  }, [tasks]);

  // Filter and sort tasks
  const processedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "deadline":
          // Tasks without deadline go to the end
          if (!a.deadline && !b.deadline) comparison = 0;
          else if (!a.deadline) comparison = 1;
          else if (!b.deadline) comparison = -1;
          else comparison = new Date(a.deadline) - new Date(b.deadline);
          break;
        case "createdAt":
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, sortBy, sortOrder]);

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    return {
      [TaskStatus.IN_PROGRESS]: processedTasks.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS,
      ),
      [TaskStatus.PENDING]: processedTasks.filter(
        (t) => t.status === TaskStatus.PENDING,
      ),
      [TaskStatus.COMPLETED]: processedTasks.filter(
        (t) => t.status === TaskStatus.COMPLETED,
      ),
    };
  }, [processedTasks]);

  const toggleSection = (status) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  if (isLoading && tasks.length === 0) {
    return (
      <div className="glass rounded-xl p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="glass rounded-xl p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-300">No tasks yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first task to get started!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Your Tasks</h2>
        <span className="text-sm text-gray-400">
          {processedTasks.length} of {tasks.length} task
          {tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="glass rounded-xl p-4 space-y-4">
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400 mr-1">Status:</span>
          <StatusPill
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            color="slate"
          >
            All
          </StatusPill>
          <StatusPill
            active={statusFilter === TaskStatus.PENDING}
            onClick={() => setStatusFilter(TaskStatus.PENDING)}
            color="yellow"
          >
            ⏳ Pending
          </StatusPill>
          <StatusPill
            active={statusFilter === TaskStatus.IN_PROGRESS}
            onClick={() => setStatusFilter(TaskStatus.IN_PROGRESS)}
            color="blue"
          >
            🔄 In Progress
          </StatusPill>
          <StatusPill
            active={statusFilter === TaskStatus.COMPLETED}
            onClick={() => setStatusFilter(TaskStatus.COMPLETED)}
            color="green"
          >
            ✅ Completed
          </StatusPill>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* No results message */}
      {processedTasks.length === 0 && (
        <div className="glass rounded-xl p-8 text-center">
          <svg
            className="w-12 h-12 text-gray-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-400">No tasks match your filters</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Status Sections */}
      {statusFilter === "all" ? (
        // Show grouped sections when viewing all
        <div className="space-y-4">
          {[
            TaskStatus.IN_PROGRESS,
            TaskStatus.PENDING,
            TaskStatus.COMPLETED,
          ].map((status) => (
            <StatusSection
              key={status}
              status={status}
              tasks={groupedTasks[status]}
              collapsed={collapsedSections[status]}
              onToggle={() => toggleSection(status)}
              onDeleteTask={onDeleteTask}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        // Show flat list when filtering by specific status
        <div className="space-y-3">
          {processedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Status Filter Pill Component
function StatusPill({ active, onClick, color, children }) {
  const colorClasses = {
    slate: active
      ? "bg-slate-600 text-white border-slate-500"
      : "bg-slate-800/50 text-gray-400 border-slate-700 hover:border-slate-600",
    yellow: active
      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      : "bg-slate-800/50 text-gray-400 border-slate-700 hover:border-yellow-500/30",
    blue: active
      ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
      : "bg-slate-800/50 text-gray-400 border-slate-700 hover:border-blue-500/30",
    green: active
      ? "bg-green-500/20 text-green-300 border-green-500/50"
      : "bg-slate-800/50 text-gray-400 border-slate-700 hover:border-green-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${colorClasses[color]}`}
    >
      {children}
    </button>
  );
}

// Collapsible Status Section Component
function StatusSection({
  status,
  tasks,
  collapsed,
  onToggle,
  onDeleteTask,
  isAdmin,
}) {
  const config = sectionConfig[status];
  const isEmpty = tasks.length === 0;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${config.borderColor} ${config.bgColor}`}
    >
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{config.icon}</span>
          <span className="font-medium text-white">{config.label}</span>
          <span className="px-2 py-0.5 bg-slate-800/50 rounded-full text-xs text-gray-400">
            {tasks.length}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            collapsed ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Section Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        }`}
      >
        <div className="p-4 pt-0 space-y-3">
          {isEmpty ? (
            <p className="text-center text-gray-500 text-sm py-4">
              No {config.label.toLowerCase()} tasks
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
