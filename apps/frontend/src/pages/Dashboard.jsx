import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTaskStore } from "../stores/taskStore.js";
import { useThemeStore } from "../stores/themeStore.js";
import { useAuthStore } from "../stores/authStore.js";
import {
  TaskList,
  DeleteTaskDialog,
  KanbanBoard,
  TaskStats,
  AddTaskModal,
} from "../features/tasks/index.js";
import { ThemeToggle } from "../components/ThemeToggle.jsx";

const VIEWS = {
  KANBAN: "kanban",
  LIST: "list",
  STATS: "stats",
};

export function Dashboard() {
  const navigate = useNavigate();
  const { tasks, isLoading, error, fetchTasks, deleteTask, clearError } =
    useTaskStore();
  const { user, logout } = useAuthStore();
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState(VIEWS.KANBAN);
  const [showForm, setShowForm] = useState(false);

  const { initTheme } = useThemeStore();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      await deleteTask(id);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
                <h1 className="text-xl font-bold text-white">Task Manager</h1>
                <p className="text-xs text-gray-400">
                  Organize your work efficiently
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">
                    {isAdmin ? (
                      <span className="text-amber-400">Admin</span>
                    ) : (
                      "User"
                    )}
                  </p>
                </div>
              </div>

              <ThemeToggle />

              {/* Users Management Link (Admin only) */}
              {isAdmin && (
                <Link
                  to="/users"
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200"
                  title="Manage Users"
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Users</span>
                </Link>
              )}

              {/* Add Task Button (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="hidden sm:inline">Add Task</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200"
                title="Logout"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-slate-800/50 rounded-xl w-fit">
            <TabButton
              active={activeView === VIEWS.KANBAN}
              onClick={() => setActiveView(VIEWS.KANBAN)}
              icon="📋"
              label="Kanban"
            />
            <TabButton
              active={activeView === VIEWS.LIST}
              onClick={() => setActiveView(VIEWS.LIST)}
              icon="📝"
              label="List"
            />
            <TabButton
              active={activeView === VIEWS.STATS}
              onClick={() => setActiveView(VIEWS.STATS)}
              icon="📊"
              label="Analytics"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Views */}
            {activeView === VIEWS.KANBAN && (
              <KanbanBoard
                tasks={tasks}
                onDeleteTask={(task) => setTaskToDelete(task)}
                isAdmin={isAdmin}
              />
            )}

            {activeView === VIEWS.LIST && (
              <TaskList
                tasks={tasks}
                isLoading={isLoading}
                error={error}
                onDeleteTask={(task) => setTaskToDelete(task)}
                isAdmin={isAdmin}
              />
            )}

            {activeView === VIEWS.STATS && (
              <TaskStats tasks={tasks} isAdmin={isAdmin} />
            )}
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog (Admin only) */}
      {isAdmin && (
        <DeleteTaskDialog
          task={taskToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTaskToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Add Task Modal (Admin only) */}
      {isAdmin && (
        <AddTaskModal isOpen={showForm} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
          : "text-gray-400 hover:text-white hover:bg-slate-700/50"
      }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
