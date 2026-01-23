import { useEffect, useState } from "react";
import { useTaskStore } from "../stores/taskStore.js";
import {
  TaskForm,
  TaskList,
  DeleteTaskDialog,
} from "../features/tasks/index.js";

export function Dashboard() {
  const { tasks, isLoading, error, fetchTasks, deleteTask, clearError } =
    useTaskStore();
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <p className="text-gray-400 mt-2">
            Organize and track your tasks efficiently
          </p>
        </header>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          {/* Sidebar - Task Form */}
          <aside>
            <TaskForm onSuccess={() => clearError()} />
          </aside>

          {/* Main - Task List */}
          <main>
            <TaskList
              tasks={tasks}
              isLoading={isLoading}
              error={error}
              onDeleteTask={(task) => setTaskToDelete(task)}
            />
          </main>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteTaskDialog
          task={taskToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTaskToDelete(null)}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
