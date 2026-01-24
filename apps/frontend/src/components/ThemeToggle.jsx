import { useThemeStore, THEMES } from "../stores/themeStore.js";

const themeOptions = [
  { value: THEMES.LIGHT, label: "Light", icon: "☀️" },
  { value: THEMES.DARK, label: "Dark", icon: "🌙" },
  { value: THEMES.SYSTEM, label: "System", icon: "💻" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800/50 rounded-xl">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            theme === option.value
              ? "bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          }`}
          title={option.label}
        >
          <span>{option.icon}</span>
          <span className="hidden lg:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
