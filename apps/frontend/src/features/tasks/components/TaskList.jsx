import { TaskCard } from "./TaskCard.jsx";

export function TaskList({ tasks, isLoading, error, onDeleteTask }) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Your Tasks</h2>
        <span className="text-sm text-gray-400">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  );
}
