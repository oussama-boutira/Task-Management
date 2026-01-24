import { create } from "zustand";
import { persist } from "zustand/middleware";

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

const getSystemTheme = () => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  const effectiveTheme = theme === THEMES.SYSTEM ? getSystemTheme() : theme;

  if (effectiveTheme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: THEMES.DARK,

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initTheme: () => {
        const { theme } = get();
        applyTheme(theme);

        // Listen for system theme changes
        if (typeof window !== "undefined") {
          window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", () => {
              const currentTheme = get().theme;
              if (currentTheme === THEMES.SYSTEM) {
                applyTheme(THEMES.SYSTEM);
              }
            });
        }
      },

      getEffectiveTheme: () => {
        const { theme } = get();
        return theme === THEMES.SYSTEM ? getSystemTheme() : theme;
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);

export { THEMES };
