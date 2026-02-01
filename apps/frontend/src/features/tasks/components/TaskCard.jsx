import { useState } from "react";
import { useTaskStore } from "../../../stores/taskStore.js";
import { useAuthStore } from "../../../stores/authStore.js";
import { TaskStatus } from "../../../schemas/task.schema.js";

const statusConfig = {
  [TaskStatus.PENDING]: {
    label: "Pending",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    icon: "⏳",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: "🔄",
  },
  [TaskStatus.COMPLETED]: {
    label: "Completed",
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    icon: "✅",
  },
};

export function TaskCard({ task, onDelete, isAdmin: isAdminProp }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateTask } = useTaskStore();
  const { user } = useAuthStore();

  // Use prop if provided, otherwise derive from user
  const isAdmin =
    isAdminProp !== undefined ? isAdminProp : user?.role === "admin";

  const handleStatusChange = async (newStatus) => {
    if (!isAdmin) return;
    setIsUpdating(true);
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const status = statusConfig[task.status] || statusConfig.pending;

  return (
    <div className="glass-light rounded-xl p-5 animate-fade-in hover:bg-white/10 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-white truncate">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Assigned User */}
          {task.assignedUserName && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {task.assignedUserName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-400">
                {task.assignedUserName}
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}
            >
              {status.icon} {status.label}
            </span>
            {task.deadline &&
              (() => {
                const now = new Date();
                const deadline = new Date(task.deadline);
                const daysRemaining = Math.ceil(
                  (deadline - now) / (1000 * 60 * 60 * 24),
                );

                let colorClass = "";
                if (task.status === "completed") {
                  colorClass =
                    "bg-slate-700/50 text-gray-400 border border-slate-600/50";
                } else if (daysRemaining <= 0) {
                  colorClass =
                    "bg-red-500/20 text-red-300 border border-red-500/30"; // Overdue
                } else if (daysRemaining <= 3) {
                  colorClass =
                    "bg-red-500/20 text-red-300 border border-red-500/30"; // Critical
                } else if (daysRemaining <= 7) {
                  colorClass =
                    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"; // Warning
                } else if (daysRemaining <= 15) {
                  colorClass =
                    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"; // Caution
                } else {
                  colorClass =
                    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"; // Safe
                }

                return (
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${colorClass}`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {deadline.toLocaleDateString()} •{" "}
                    {deadline.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                );
              })()}
            <span className="text-xs text-gray-500">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Admin-only actions */}
        {isAdmin && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Status dropdown */}
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Delete button */}
            <button
              onClick={() => onDelete(task)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
              title="Delete task"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
