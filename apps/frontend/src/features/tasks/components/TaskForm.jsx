import { useState } from "react";
import { useTaskStore } from "../../../stores/taskStore.js";
import { createTaskSchema } from "../../../schemas/task.schema.js";

export function TaskForm({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask } = useTaskStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const result = createTaskSchema.safeParse({
      title,
      description: description || undefined,
    });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask(result.data);
      setTitle("");
      setDescription("");
      onSuccess?.();
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Add New Task</h2>

      {errors.form && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
          {errors.form}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          maxLength={255}
          className={`w-full px-4 py-3 bg-slate-800/50 border ${
            errors.title ? "border-red-500" : "border-slate-600"
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/255 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)..."
          rows={3}
          maxLength={2000}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/2000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Adding Task...
          </>
        ) : (
          <>
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
            Add Task
          </>
        )}
      </button>
    </form>
  );
}
