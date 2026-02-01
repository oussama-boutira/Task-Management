import { useTaskStore } from "../../../stores/taskStore.js";
import { TaskStatus } from "../../../schemas/task.schema.js";

const columns = [
  {
    id: TaskStatus.PENDING,
    title: "📋 To Do",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    headerBg: "bg-amber-500/10",
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: "🔄 In Progress",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    headerBg: "bg-blue-500/10",
  },
  {
    id: TaskStatus.COMPLETED,
    title: "✅ Completed",
    color: "from-emerald-500/20 to-green-500/20",
    borderColor: "border-emerald-500/30",
    headerBg: "bg-emerald-500/10",
  },
];

function KanbanCard({ task, onDelete, isAdmin }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("currentStatus", task.status);
  };

  return (
    <div
      draggable={isAdmin}
      onDragStart={isAdmin ? handleDragStart : undefined}
      className={`group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 ${
        isAdmin ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/20`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-white text-sm leading-tight flex-1">
          {task.title}
        </h4>
        {isAdmin && (
          <button
            onClick={() => onDelete(task)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
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
          </button>
        )}
      </div>
      {task.description && (
        <p className="mt-2 text-xs text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Assigned User */}
      {task.assignedUserName && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
            {task.assignedUserName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400">{task.assignedUserName}</span>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${colorClass}`}
              >
                <svg
                  className="w-3 h-3"
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
        <span className="text-[10px] text-gray-500">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, onDelete, onDrop, isAdmin }) {
  const handleDragOver = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-primary-500/50");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("ring-2", "ring-primary-500/50");
  };

  const handleDrop = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-primary-500/50");
    const taskId = e.dataTransfer.getData("taskId");
    const currentStatus = e.dataTransfer.getData("currentStatus");
    if (currentStatus !== column.id) {
      onDrop(taskId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-gradient-to-b ${column.color} backdrop-blur-sm border ${column.borderColor} rounded-2xl min-h-[500px] transition-all duration-200`}
    >
      {/* Column Header */}
      <div
        className={`${column.headerBg} px-4 py-3 rounded-t-2xl border-b ${column.borderColor}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{column.title}</h3>
          <span className="bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-700/50 rounded-xl">
            <p className="text-sm text-gray-500">
              {isAdmin ? "Drop tasks here" : "No tasks"}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onDeleteTask, isAdmin = false }) {
  const { updateTask } = useTaskStore();

  const handleDrop = async (taskId, newStatus) => {
    if (!isAdmin) return;
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={getTasksByStatus(column.id)}
          onDelete={onDeleteTask}
          onDrop={handleDrop}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
